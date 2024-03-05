import fs from "node:fs/promises"
import path from "path"

const dropboxPath = process.env.DROPBOX_DIRECTORY || ""


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