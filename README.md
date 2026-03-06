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

## UI

<img width="1694" height="947" alt="image" src="https://github.com/user-attachments/assets/c8cc6457-f91d-404e-81b5-507f7e07602d" />
<img width="1694" height="1098" alt="image" src="https://github.com/user-attachments/assets/faebf561-538d-4a5d-b6ce-9abc108eb4b3" />
<img width="1694" height="855" alt="image" src="https://github.com/user-attachments/assets/ed3e2add-e7b4-4c1c-aa3e-3e997946cdd4" />
<img width="1694" height="931" alt="image" src="https://github.com/user-attachments/assets/b6c2a6c2-5b4d-4238-a8fb-945244765501" />
<img width="1694" height="964" alt="image" src="https://github.com/user-attachments/assets/00f460f8-25c2-4754-b5e0-c863d981bd59" />

## Architecture
<img width="1488" height="785" alt="image" src="https://github.com/user-attachments/assets/6edb2db4-fae3-41d5-843b-d617bfc443c1" />
<img width="1557" height="1514" alt="image" src="https://github.com/user-attachments/assets/36134070-bb53-48e4-951c-4f063061a654" />









