# SimpleTransfer

SimpleTransfer is a simple web server helping sending large files that couldn't fit as email's attachment.
It's build with users who own their web server in mind (no http upload of files).

## Concept

- Copy files to transfer to the server's "dropbox" directory by any way you want and your server allows (rsync, scp, ftp, etc.);
- Create a transfer picking a file or directory in the "dropbox":
    - Add object and message;
    - Add recipients emails;
- File or directory is zipped then move to "transfers" directory (original files and folders in "dropbox" remain untouched, you have to delete them your self if needed);
- A mail is send to each recipients, with a unique download url;
- When a recipient downloaded the transfer, a mail is send to transfer's owner;

It's meant to be a simple tool for personnal use:
- No transfer size limit;
- No recipients number limit;
- No transfer expiration date, transfers can be deactivated or deleted manually;
- Mono user design in mind, you can add many, but they'll all share the same dropbox;


## Install

Clone this repository:

```shellscript
git clone https://github.com/Fenykepy/simpletransfer.git simpletransfer
cd simplestransfer
```

Install dependencies:

```shellscript
npm install
```

Setup environment variables:

```shellscript
cp env-example .env
```

Change the environment variables to your needs (transfers and dropbox directories path, email configuration, etc.):

```shellscript
vim .env
```

Setup database:

```shellscript
npx prisma push
```

Add a user:

```shellscript
npx vite-node ./manage.ts addUser --email <user_mail> --password <user_password>
```


### Development
Run the Express server with Vite dev middleware:

```shellscript
npm run dev
```

### Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```


## List command line utilities

```shellscript
cd simpletransfer
npx vite-node ./manage.ts --help
```