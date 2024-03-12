import parseArgs from "minimist"
import readline from "readline"

import { db } from "./app/utils/db.server"
import { deleteArchive } from "./app/utils/filesystem.server"
import { register, updatePassword, updateEmail } from "./app/utils/session.server"
import {
  validateEmail,
  validatePassword,
} from "./app/utils/validate"
import { humanSize } from "./app/utils/humanSize"


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})



const args = process.argv.slice(2)
const argv = parseArgs(args)

/* Print help */
if (args[0] === "help" || argv.h || argv.help) {
  const helpString = `
help                                                                   show this help
--help                                                                 show this help
-h                                                                     show this help

transfersInfo                                                          show some info about transfers

listUsers                                                              list all users
addUser --email <user_mail> --password <user_password>                 add a new user
updateUserPassword --email <user_mail> --newPassword <user_password>   update a user's password
updateUserEmail --email <user_mail> --newEmail <new_user_mail>         update a user's email
deleteUser --email <user_mail>                                         delete a user

deleteTransfer --id <transfer_id>                                      delete a transfer
`
  console.log(helpString)
  process.exit()
}


/* List some infos */
if (args[0] === "transfersInfo") {
  const users = await db.user.aggregate({
    _count: { id: true }
  })

  const allTransfers = await db.transfer.aggregate({
    _count: { id: true },
  })

  const activeTransfers = await db.transfer.aggregate({
    _count: { id: true },
    _sum: { archiveSize: true },
    where: { active: true },
  })

  const archiveSize = activeTransfers._sum.archiveSize || 0

  console.log(`${users._count.id} users.`)
  console.log(`${activeTransfers._count.id} active transfers.`)
  console.log(`${allTransfers._count.id - activeTransfers._count.id} expired transfers.`)
  console.log(`${allTransfers._count.id} transfers total.`)
  console.log(`${humanSize(archiveSize)} of archives in transfers directory.`)
}

/* List existing users */
if (args[0] === "listUsers") {
  const users = await db.user.findMany({
    select: {
      email: true,
      id: true,
      createdAt: true,
    }
  })

  for (let user of users) {
    printUser(user)
  }

  process.exit()
}


/* Add new user */
if (args[0] === "addUser") {
  if (!argv.email) {
    console.log("Error: --email option is mandatory")
    process.exit(1)
  }
  if (!argv.password) {
    console.log("Error: --password option is mandatory")
    process.exit(1)
  }
  const email = argv.email.trim()
  const password = argv.password.trim()
  const emailError = validateEmail(email)
  if (emailError) {
    console.log(`Error: ${emailError}`)
    process.exit(1)
  }
  
  const userExists = await findUser(email)
  if (userExists) {
    console.log(`Error: existing user found with email ${email}`)
    process.exit(1)
  }
  
  const passwordError = validatePassword(password)
  if (passwordError) {
    console.log(`Error: ${passwordError}`)
    process.exit(1)
  }

  const user = await register({ email, password })
  if (!user) {
    console.log("Error creating user")
    process.exit(1)
  } 

  printUser(user)
  process.exit()
}


/* Update user password */
if (args[0] === "updateUserPassword") {
  if (!argv.email) {
    console.log("Error: --email option is mandatory")
    process.exit(1)
  }
  if (!argv.newPassword) {
    console.log("Error: --newPassword option is mandatory")
    process.exit(1)
  }
  const email = argv.email.trim()
  const password = argv.newPassword.trim()
  const emailError = validateEmail(email)
  if (emailError) {
    console.log(`Error: ${emailError}`)
    process.exit(1)
  }

  const user = await findUser(email)
  if (!user) {
    console.log(`Error: no user found with email ${argv.email}`)
    process.exit(1)
  }

  const passwordError = validatePassword(password)
  if (passwordError) {
    console.log(`Error: ${passwordError}`)
    process.exit(1)
  }

  await updatePassword({ email, password })
  process.exit()
}



/* Update user email */
if (args[0] === "updateUserEmail") {
  if (!argv.email) {
    console.log("Error: --email option is mandatory")
    process.exit(1)
  }
  if (!argv.newEmail) {
    console.log("Error: --newEmail option is mandatory")
    process.exit(1)
  }
  const email = argv.email.trim()
  const newEmail = argv.newEmail.trim()
  const emailError = validateEmail(email)
  if (emailError) {
    console.log(`Error: ${emailError}`)
    process.exit(1)
  }
  const newEmailError = validateEmail(newEmail)
  if (newEmailError) {
    console.log(`Error: ${newEmailError}`)
    process.exit(1)
  }
  
  const emailExists = await findUser(newEmail)
  if (emailExists) {
    console.log(`Error: existing user found with email ${newEmail}`)
    process.exit(1)
  }

  const user = await findUser(email)
  if (!user) {
    console.log(`Error: no user found with email ${argv.email}`)
    process.exit(1)
  }

  await updateEmail({ email, newEmail })
  process.exit()
}


/* Delete user */
if (args[0] === "deleteUser") {
  if (!argv.email) {
    console.log("Error: --email option is mandatory")
    process.exit(1)
  }
  const user = await findUser(argv.email)
  if (!user) {
    console.log(`Error: no user found with email ${argv.email}`)
    process.exit(1)
  }

  const transfers = await db.transfer.aggregate({
    _count: {
      id: true,
    },
    where: {
      userId: user.id,
    }
  })
  let count = transfers._count.id

  if (count > 0) {
    console.log(`This user has ${count} transfers.`)
    let ans = await askYesNo("Are you sure you want to delete them all?")

    if (!ans) { // user answered no
      process.exit()
    }

    let transfers = await db.transfer.findMany({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        archiveName: true,
      }
    })

    for (let transfer of transfers) {
      // Delete transfer and archives
      await deleteTransfer(transfer.id, transfer.archiveName)
    }
  }

  // Delete user
  await db.user.delete({
    where: {
      id: user.id,
    }
  })
  process.exit()
}

/* Delete transfer */
if (args[0] === "deleteTransfer") {
  if (!argv.id) {
    console.log("Error: --id option is mandatory")
    process.exit(1)
  }

  const transfer = await db.transfer.findUnique({
    where: {
      id: argv.id,
    },
    select: {
      id: true,
      archiveName: true,
    },
  })

  if (!transfer) {
    console.log(`No transfer found with id ${argv.id}`)
    process.exit(1)
  }

  await deleteTransfer(transfer.id, transfer.archiveName)
  process.exit()
}


interface PrintUserArgs {
  email: string,
  id: string,
  createdAt: Date,
}

function printUser(user: PrintUserArgs) {
  console.log(`Email: ${user.email} - Id: ${user.id} - Created at: ${user.createdAt.toISOString()}`)
}

function findUser(email: string) {
  return db.user.findUnique({
    where: { email }
  })
}

function ask(question: string) {
  return new Promise((resolve, reject) => {
    rl.question(question, (input) => resolve(input))
  })
}

async function askYesNo(question: string) {
  while (true) {
    let ans = await ask(question + " [yes/no]: ")
    if (ans === "yes") return true
    if (ans === "false") return false
    console.log('Choice must be "yes" or "no"')
  }
}

async function deleteTransfer(id: string, archiveName: string) {
  try {
    deleteArchive(archiveName)
  } catch(error) {
    console.error(error)
  }

  await db.transfer.delete({
    where: {
      id,
    }
  })
}

process.exit()