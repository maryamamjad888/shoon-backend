"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
class MyFileProviderService extends utils_1.AbstractFileProviderService {
    constructor(_, options) {
        super();
        this.getUploadFilePath = (baseDir, fileKey) => {
            return path_1.default.join(baseDir, fileKey);
        };
        this.getUploadFileUrl = (fileKey) => {
            // This returns just the path starting from /static instead of full localhost URL
            return `/static/${fileKey}`;
        };
        this.uploadDir_ = options?.upload_dir || path_1.default.join(process.cwd(), "static");
        this.privateUploadDir_ = options?.private_upload_dir || path_1.default.join(process.cwd(), "static");
    }
    async upload(file) {
        if (!file) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `No file provided`);
        }
        if (!file.filename) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `No filename provided`);
        }
        const parsedFilename = path_1.default.parse(file.filename);
        const baseDir = file.access === "public" ? this.uploadDir_ : this.privateUploadDir_;
        await this.ensureDirExists(baseDir, parsedFilename.dir);
        const fileKey = path_1.default.join(parsedFilename.dir, `${file.access === "public" ? "" : "private-"}${Date.now()}-${parsedFilename.base}`);
        const filePath = this.getUploadFilePath(baseDir, fileKey);
        const fileUrl = this.getUploadFileUrl(fileKey);
        const content = Buffer.from(file.content, "binary");
        await promises_1.default.writeFile(filePath, content);
        return {
            key: fileKey,
            url: fileUrl,
        };
    }
    async delete(file) {
        const baseDir = file.fileKey.startsWith("private-")
            ? this.privateUploadDir_
            : this.uploadDir_;
        const filePath = this.getUploadFilePath(baseDir, file.fileKey);
        try {
            await promises_1.default.access(filePath, promises_1.default.constants.W_OK);
            await promises_1.default.unlink(filePath);
        }
        catch (e) {
            // The file does not exist, we don't do anything
            if (e.code !== "ENOENT") {
                throw e;
            }
        }
        return;
    }
    async getPresignedDownloadUrl(file) {
        const isPrivate = file.fileKey.startsWith("private-");
        const baseDir = isPrivate ? this.privateUploadDir_ : this.uploadDir_;
        const filePath = this.getUploadFilePath(baseDir, file.fileKey);
        try {
            await promises_1.default.access(filePath, promises_1.default.constants.F_OK);
        }
        catch {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `File with key ${file.fileKey} not found`);
        }
        return this.getUploadFileUrl(file.fileKey);
    }
    async ensureDirExists(baseDir, dirPath) {
        const relativePath = path_1.default.join(baseDir, dirPath);
        try {
            await promises_1.default.access(relativePath, promises_1.default.constants.F_OK);
        }
        catch (e) {
            await promises_1.default.mkdir(relativePath, { recursive: true });
        }
        return relativePath;
    }
}
MyFileProviderService.identifier = "my-file";
exports.default = MyFileProviderService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9tb2R1bGVzL215LWZpbGUvc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHFEQUFvRjtBQUNwRiwyREFBNEI7QUFDNUIsZ0RBQXVCO0FBRXZCLE1BQU0scUJBQXNCLFNBQVEsbUNBQTJCO0lBTTdELFlBQVksQ0FBQyxFQUFFLE9BQU87UUFDcEIsS0FBSyxFQUFFLENBQUE7UUFNRCxzQkFBaUIsR0FBRyxDQUFDLE9BQWUsRUFBRSxPQUFlLEVBQVUsRUFBRTtZQUN2RSxPQUFPLGNBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFBO1FBQ3BDLENBQUMsQ0FBQTtRQUVPLHFCQUFnQixHQUFHLENBQUMsT0FBZSxFQUFVLEVBQUU7WUFDckQsaUZBQWlGO1lBQ2pGLE9BQU8sV0FBVyxPQUFPLEVBQUUsQ0FBQTtRQUM3QixDQUFDLENBQUE7UUFYQyxJQUFJLENBQUMsVUFBVSxHQUFHLE9BQU8sRUFBRSxVQUFVLElBQUksY0FBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUE7UUFDM0UsSUFBSSxDQUFDLGlCQUFpQixHQUFHLE9BQU8sRUFBRSxrQkFBa0IsSUFBSSxjQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQTtJQUM1RixDQUFDO0lBV0QsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJO1FBQ2YsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ1YsTUFBTSxJQUFJLG1CQUFXLENBQUMsbUJBQVcsQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLGtCQUFrQixDQUFDLENBQUE7UUFDM0UsQ0FBQztRQUVELElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDbkIsTUFBTSxJQUFJLG1CQUFX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