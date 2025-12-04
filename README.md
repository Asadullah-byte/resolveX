"# Upload File Feature: Upload file to AI and show history of Upload" 
Added Groq-API for fiell processing and anomolies detection.
***

```
#Gets all new changes
npm pull

``` 


To pull are new changes sets local to most updated with remote.

```
npm install 
#or
npm i

```

Before procceding check if following == Files& Folder== are included:

### For Backend:

- Check client-auth it must have updated code in side **src**.
- src must have ==services/groqServices.js & models/uploadedFiles.js== , Modified code for  conrtroller/clientController.js , routes/clientRoutes.js and main server.js

### For Frontend:

- Updated src/components/UploadHsitoryTable.jsx, pages/client/UploadFiles.jsx, store/clientStore.js
***
### Database/ORM:

- Before runnig project sync your DB by running.

- Make sure your backend is not running at any port.
```
cd backend
npx prisma migrate dev
npx prisma generate
npx prisma studio
``` 

## How to Run Project?

Make sure to run run your DB's (e.g MongoDB, PostgreSQL on Docker)

### For Backend Only:
== Go to each microservice (e.g services/client-service, services/auth-service) == and run command:
Note
:  Open multiple terminal to avoid frustration.

``` npm start ```

Ensure
: That client-service is running at port: `3001` and auth-service at port: `3000`

***
## Expected Behaviour of App:

1. User must signup if not registered and login if registered.
2. user will be directed to upload page where user need to upload file.
3. files should be saved in `public/temp` folder locally and reference and groq-API response shall be in `MongoDB` 
4. File have three Phases: Pending, Processing, Analyzed.
5. After processing files shall be viewd in Upload History Table where user can also view his file processed data.




