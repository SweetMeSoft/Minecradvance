require('dotenv').config();
const ftp = require("basic-ftp");
const path = require('path');
const fs = require('fs').promises;

const LOCAL_BUILD_PATH = path.join(__dirname, "./dist/Minecradvance/browser");
const REMOTE_PATH = "/domains/paleturquoise-parrot-545219.hostingersite.com/public_html/";
const CONCURRENCY = 8;

async function getLocalFiles(dir, baseDir) {
  let results = [];
  const list = await fs.readdir(dir, { withFileTypes: true });
  for (const item of list) {
    const fullPath = path.join(dir, item.name);
    const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
    if (item.isDirectory()) {
      results = results.concat(await getLocalFiles(fullPath, baseDir));
    } else {
      results.push({ local: fullPath, remote: path.posix.join(REMOTE_PATH, relativePath) });
    }
  }
  return results;
}

async function deploy() {
  console.log("🚀 Iniciando compilación y despliegue (MODO ULTRA RÁPIDO / PARALELO)...");
  console.log(`📂 Origen: ${LOCAL_BUILD_PATH}`);
  console.log(`☁️  Destino: ${REMOTE_PATH}`);

  const ftpConfig = {
    host: process.env.ftp_host,
    user: process.env.ftp_user,
    password: process.env.ftp_pass,
    port: 21,
    secure: false
  };

  async function runWorkers(tasks, taskFn) {
    const workers = Array(CONCURRENCY).fill(null).map(async () => {
      const client = new ftp.Client();
      try {
        await client.access(ftpConfig);
        while (tasks.length > 0) {
          const task = tasks.shift();
          if (!task) continue;
          try {
            await taskFn(client, task);
          } catch (err) {
            task.retries = (task.retries || 0) + 1;
            if (task.retries < 3) {
              tasks.push(task); // Re-encolar
            } else {
              console.log(`\n❌ Fallo definitivo en tarea: ${err.message}`);
            }
          }
        }
      } catch (err) {
        // Si el worker falla al conectar, las tareas quedan en la cola y los otros las toman
      } finally {
        client.close();
      }
    });
    await Promise.all(workers);
  }

  try {
    const masterClient = new ftp.Client();
    await masterClient.access(ftpConfig);
    console.log('✅ Conexión FTP maestra establecida.');

    console.log('🗑️  Listando directorio remoto para limpieza...');
    await masterClient.ensureDir(REMOTE_PATH);
    const remoteItems = await masterClient.list(REMOTE_PATH);
    const itemsToDelete = remoteItems.filter(i => i.name !== '.' && i.name !== '..');
    masterClient.close();

    if (itemsToDelete.length > 0) {
      console.log(`�️  Borrando ${itemsToDelete.length} elementos remotos en paralelo...`);
      let deletedCount = 0;
      await runWorkers([...itemsToDelete], async (client, item) => {
        const itemPath = path.posix.join(REMOTE_PATH, item.name);
        if (item.isDirectory) {
          await client.cd(itemPath);
          await client.clearWorkingDir();
          await client.cd('/');
          await client.removeDir(itemPath);
        } else {
          await client.remove(itemPath);
        }
        deletedCount++;
        process.stdout.write(`\r🗑️  Borrados: ${deletedCount}/${itemsToDelete.length}`.padEnd(60));
      });
      console.log('\n✅ Limpieza completada.');
    } else {
      console.log('✅ El directorio remoto ya estaba vacío.');
    }

    console.log('🔄 Preparando archivos locales para subir...');
    const filesToUpload = await getLocalFiles(LOCAL_BUILD_PATH, LOCAL_BUILD_PATH);

    // Asegurar que los subdirectorios existan (usando pool para ser más rápido)
    const dirsToCreate = [...new Set(filesToUpload.map(f => path.posix.dirname(f.remote)))];
    const uniqueDirs = dirsToCreate.filter(d => d !== REMOTE_PATH && d !== REMOTE_PATH.slice(0, -1));

    if (uniqueDirs.length > 0) {
      console.log(`📁 Creando ${uniqueDirs.length} directorios remotos...`);
      await runWorkers([...uniqueDirs], async (client, dir) => {
        await client.ensureDir(dir);
      });
    }

    console.log(`🚀 Subiendo ${filesToUpload.length} archivos en paralelo (${CONCURRENCY} conexiones simultáneas)...`);
    let uploadedCount = 0;

    await runWorkers([...filesToUpload], async (client, file) => {
      await client.uploadFrom(file.local, file.remote);
      uploadedCount++;
      process.stdout.write(`\r⬆️  Subidos: ${uploadedCount}/${filesToUpload.length} | ${path.basename(file.local)}`.substring(0, 80).padEnd(80));
    });

    console.log(`\n✅ ¡Éxito total! Se subieron ${uploadedCount} archivos a Hostinger en tiempo récord.`);
  }
  catch (err) {
    console.log("\n❌ Error crítico:", err);
  }
}

deploy();
