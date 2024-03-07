import fs from "node:fs/promises"
import { createReadStream } from "node:fs"
import path from "path"
import { v4 as uuidv4 } from "uuid" 
import AdmZip from "adm-zip"

const dropboxPath = process.env.DROPBOX_DIRECTORY || ""
const transfersDirectoryPath = process.env.TRANSFERS_DIRECTORY || ""


// returns true if a file exists at type, any type (file, directory, sym link...)
export async function fileExists(path: string): Promise<boolean> {
  try {
    await fs.stat(path)
    return true
  } catch {
    return false
  }
}


// returns true if a regular file exists at path
export async function isFile(path: string): Promise<boolean> {
  try {
    const stats = await fs.stat(path)
    return stats.isFile()
  } catch {
    return false
  }
}


// returns true if a directory exists at path
export async function isDirectory(path: string): Promise<boolean> {
  try {
    const stats = await fs.stat(path)
    return stats.isDirectory()
  } catch {
    return false
  }
}


// returns true if file or directory is at root of dropbox directory
export async function isDropboxEntry(filename: string): Promise<boolean> {
  try {
    const stats = await fs.stat(path.join(dropboxPath, filename))
    return stats.isFile() || stats.isDirectory()
  } catch {
    return false
  }
}


// returns root content of dropbox directory
interface DropboxEntry {
  name: string
  isDirectory: boolean
}

export async function listDropbox(): Promise<DropboxEntry[]> {
  const content = await fs.readdir(dropboxPath, { withFileTypes: true })
  let results = []
  for (let dirent of content) {
    if (dirent.isDirectory()) {
      results.push({ name: dirent.name, isDirectory: true })
    } else if (dirent.isFile()) {
      results.push({ name: dirent.name, isDirectory: false })
    }
  }
  return results
}

interface CreateArchiveResult {
  date: Date
  uuid: string
  size: number
  name: string
}

export async function createArchive(dropboxFileName: string): Promise<CreateArchiveResult> {
  // We don't catch because we want a server error if creation archive fails
  const date = new Date()
  const uuid = uuidv4()
  // We use date in filename so it's easyer to sort them in an external access
  const zipName = `${date.toISOString().replaceAll(":", ".")}_${uuid}.zip`
  const zipPath = path.join(transfersDirectoryPath, zipName)
  const dropboxFilePath = path.join(dropboxPath, dropboxFileName)
  const stats = await fs.stat(dropboxFilePath)

  // Zip file and move it to transfers directory
  let zip = new AdmZip()
  if (stats.isFile()) {
    zip.addLocalFile(dropboxFilePath)
  } else if (stats.isDirectory()) {
    zip.addLocalFolder(dropboxFilePath)
  }
  zip.writeZip(zipPath)

  const zipStats = await fs.stat(zipPath)

  return { date, uuid, size: zipStats.size, name: zipName }
}

export async function streamArchive(zipName: string) {
  const zipPath = path.join(transfersDirectoryPath, zipName)
  if (!await isFile(zipPath)) {
    throw new Error("Transfer file not found")
  }
  
  return createReadStream(zipPath)
}