import { Injectable } from '@angular/core';
import {
  AdvancementsJSON,
  ParsedAdvancements,
  UserAdvancement,
  isUserAdvancement,
} from '../models/advancement.model';

/**
 * Error codes for file parsing failures.
 */
export enum FileParseErrorCode {
  InvalidFileType = 'INVALID_FILE_TYPE',
  FileReadError = 'FILE_READ_ERROR',
  InvalidJSON = 'INVALID_JSON',
  InvalidStructure = 'INVALID_STRUCTURE',
  EmptyFile = 'EMPTY_FILE',
}

/**
 * Custom error class for file parsing failures with user-friendly messages.
 */
export class FileParseError extends Error {
  constructor(
    public readonly code: FileParseErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'FileParseError';
  }
}

/**
 * Service responsible for reading and parsing Minecraft advancement files.
 *
 * Accepts a File object (from drag & drop or file input), validates the
 * structure, and returns typed ParsedAdvancements data.
 */
@Injectable({
  providedIn: 'root',
})
export class FileParserService {
  /** Accepted file extensions */
  private readonly ACCEPTED_EXTENSIONS = ['.json'];
  /** Maximum file size in bytes (10 MB) */
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024;

  /**
   * Parse a File object into typed advancement data.
   *
   * @param file - The File object from a drag & drop or file input
   * @returns Promise resolving to ParsedAdvancements
   * @throws FileParseError with descriptive error code and message
   */
  async parseFile(file: File): Promise<ParsedAdvancements> {
    this.validateFileType(file);
    const content = await this.readFileContent(file);
    const json = this.parseJSON(content);
    return this.extractAdvancements(json);
  }

  /**
   * Parse raw JSON string content directly (e.g., from localStorage).
   */
  parseRawJSON(content: string): ParsedAdvancements {
    const json = this.parseJSON(content);
    return this.extractAdvancements(json);
  }

  /**
   * Validate that the file is a JSON file and within size limits.
   */
  private validateFileType(file: File): void {
    if (!file) {
      throw new FileParseError(
        FileParseErrorCode.EmptyFile,
        'No file was provided. Please select a valid JSON file.'
      );
    }

    const fileName = file.name.toLowerCase();
    const hasValidExtension = this.ACCEPTED_EXTENSIONS.some((ext) =>
      fileName.endsWith(ext)
    );

    if (!hasValidExtension) {
      throw new FileParseError(
        FileParseErrorCode.InvalidFileType,
        `Invalid file type: "${file.name}". ` +
          `Please select a .json file from your Minecraft saves folder.`
      );
    }

    if (file.size === 0) {
      throw new FileParseError(
        FileParseErrorCode.EmptyFile,
        'The file is empty. Please select a valid advancements JSON file.'
      );
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new FileParseError(
        FileParseErrorCode.InvalidFileType,
        `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). ` +
          `Maximum allowed size is ${this.MAX_FILE_SIZE / 1024 / 1024} MB.`
      );
    }
  }

  /**
   * Read file content as text using the FileReader API.
   */
  private readFileContent(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(
            new FileParseError(
              FileParseErrorCode.FileReadError,
              'Failed to read the file content. Please try again.'
            )
          );
        }
      };

      reader.onerror = () => {
        reject(
          new FileParseError(
            FileParseErrorCode.FileReadError,
            'An error occurred while reading the file. ' +
              'Please check file permissions and try again.'
          )
        );
      };

      reader.readAsText(file);
    });
  }

  /**
   * Parse a raw string into a JSON object.
   */
  private parseJSON(content: string): AdvancementsJSON {
    if (!content || content.trim().length === 0) {
      throw new FileParseError(
        FileParseErrorCode.EmptyFile,
        'The file content is empty.'
      );
    }

    try {
      return JSON.parse(content) as AdvancementsJSON;
    } catch {
      throw new FileParseError(
        FileParseErrorCode.InvalidJSON,
        'The file does not contain valid JSON. ' +
          'Please make sure you selected the correct advancements file.'
      );
    }
  }

  /**
   * Extract and validate advancement entries from the parsed JSON.
   */
  private extractAdvancements(json: AdvancementsJSON): ParsedAdvancements {
    if (typeof json !== 'object' || json === null || Array.isArray(json)) {
      throw new FileParseError(
        FileParseErrorCode.InvalidStructure,
        'Invalid file structure. The advancements file should be a JSON object, ' +
          'not an array or primitive value.'
      );
    }

    // Extract DataVersion
    const dataVersion =
      typeof json['DataVersion'] === 'number' ? json['DataVersion'] : 0;

    // Extract advancement entries
    const advancements = new Map<string, UserAdvancement>();
    let validEntryCount = 0;

    for (const [key, value] of Object.entries(json)) {
      // Skip non-advancement keys
      if (key === 'DataVersion') {
        continue;
      }

      if (isUserAdvancement(value)) {
        advancements.set(key, value);
        validEntryCount++;
      }
    }

    // Validate that we found at least some advancements
    if (validEntryCount === 0) {
      throw new FileParseError(
        FileParseErrorCode.InvalidStructure,
        'No valid advancement entries found in the file. ' +
          'Please make sure you selected the correct file from your ' +
          'Minecraft saves/advancements folder.'
      );
    }

    return {
      dataVersion,
      advancements,
    };
  }
}
