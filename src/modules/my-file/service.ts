import { AbstractFileProviderService, MedusaError } from "@medusajs/framework/utils"
import fs from "fs/promises"
import path from "path"

class MyFileProviderService extends AbstractFileProviderService {
  static identifier = "my-file"
  
  private uploadDir_: string
  private privateUploadDir_: string

  constructor(_, options) {
    super()
    
    this.uploadDir_ = options?.upload_dir || path.join(process.cwd(), "static")
    this.privateUploadDir_ = options?.private_upload_dir || path.join(process.cwd(), "static")
  }

  private getUploadFilePath = (baseDir: string, fileKey: string): string => {
    return path.join(baseDir, fileKey)
  }

  private getUploadFileUrl = (fileKey: string): string => {
    // This returns just the path starting from /static instead of full localhost URL
    return `/static/${fileKey}`
  }

  async upload(file) {
    if (!file) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, `No file provided`)
    }

    if (!file.filename) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, `No filename provided`)
    }

    const parsedFilename = path.parse(file.filename)
    const baseDir = file.access === "public" ? this.uploadDir_ : this.privateUploadDir_

    await this.ensureDirExists(baseDir, parsedFilename.dir)

    const fileKey = path.join(
      parsedFilename.dir,
      `${file.access === "public" ? "" : "private-"}${Date.now()}-${parsedFilename.base}`
    )

    const filePath = this.getUploadFilePath(baseDir, fileKey)
    const fileUrl = this.getUploadFileUrl(fileKey)

    const content = Buffer.from(file.content, "binary")
    await fs.writeFile(filePath, content)

    return {
      key: fileKey,
      url: fileUrl,
    }
  }

  async delete(file) {
    const baseDir = file.fileKey.startsWith("private-")
      ? this.privateUploadDir_
      : this.uploadDir_

    const filePath = this.getUploadFilePath(baseDir, file.fileKey)

    try {
      await fs.access(filePath, fs.constants.W_OK)
      await fs.unlink(filePath)
    } catch (e) {
      // The file does not exist, we don't do anything
      if (e.code !== "ENOENT") {
        throw e
      }
    }

    return
  }

  async getPresignedDownloadUrl(file) {
    const isPrivate = file.fileKey.startsWith("private-")
    const baseDir = isPrivate ? this.privateUploadDir_ : this.uploadDir_
    const filePath = this.getUploadFilePath(baseDir, file.fileKey)

    try {
      await fs.access(filePath, fs.constants.F_OK)
    } catch {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `File with key ${file.fileKey} not found`
      )
    }

    return this.getUploadFileUrl(file.fileKey)
  }

  private async ensureDirExists(baseDir: string, dirPath: string) {
    const relativePath = path.join(baseDir, dirPath)

    try {
      await fs.access(relativePath, fs.constants.F_OK)
    } catch (e) {
      await fs.mkdir(relativePath, { recursive: true })
    }

    return relativePath
  }
}

export default MyFileProviderService