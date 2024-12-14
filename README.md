# Form Builder
A Full Stack MERN app for building dynamic forms with drag and drop interface &amp; to track and view the responses received in the created form.

https://easyformbuilder.netlify.app/

(Profile picture upload only works in local development as costs money in deployed server.)


## Installation
You need to install [pnpm](https://pnpm.io/installation) first as pnpm workspace is used for this monorepo.

```bash
npm install -g pnpm
```

Clone the project

```bash
git clone https://github.com/RohanShrestha01/form-builder.git
```

then navigate into the project

```
cd form-builder
```

Now, Install the packages

```bash
pnpm i
```

then build the shared validation package

```bash
pnpm -F @form-builder/validation build
```

Also, create .env file with the help of .env.example file for both client and server. You can use [Brevo](https://www.brevo.com/) for free SMTP server and PgAdmin for database.

Run the project with command

```bash
pnpm dev
```

<h2> Built with </h2>
<ul>
  <li>Frontend: <b> React, TypeScript, Tailwind, React Hook Form, Zod, ShadcnUI, React Router, DND Kit, Tanstack Query, Tanstack Table, Tiptap, React Dropzone, React Easy Crop, Zustand </b></li>
  <li>Backend:  <b> Node, Express, TypeScript, Nodemailer, Multer, JWT </b> </li>
  <li>Database: <b> PostgreSql & PgAdmin </b> </li>
</ul>

<h2> Features </h2>
**Design Decisions**  
**1. Frontend Framework: Vite + React**  
We chose Vite as the build tool due to its lightning-fast development experience, leveraging modern JavaScript features. React was selected for its component-based architecture, enabling modular and reusable UI development. Vite’s hot module replacement (HMR) ensures rapid iteration, enhancing developer productivity.

**2. Backend Framework: Node.js + Express.js**  
Node.js offers an event-driven, non-blocking architecture ideal for scalable applications. Express.js provides a minimalist web framework, enabling us to build RESTful APIs quickly.

**3. TypeScript Integration**  
TypeScript was used throughout the project to ensure type safety, reducing runtime errors and improving code maintainability.

**Database Structure (PostgreSQL)**  
**1. Tables Overview:**

- **Users**: Manages user authentication and profile information.  
  - `id` (PK) - Unique user ID  
  - `email` - User's email address  
  - `password_hash` - Securely hashed password  
  - `created_at` - Timestamp of account creation

- **Forms**: Stores form metadata.  
  - `id` (PK) - Unique form ID  
  - `title` - Form title  
  - `description` - Form description  
  - `created_by` (FK) - References `Users(id)`  
  - `created_at` - Timestamp of form creation

- **Fields**: Contains form fields' structure and properties.  
  - `id` (PK) - Unique field ID  
  - `form_id` (FK) - References `Forms(id)`  
  - `type` - Field type (text, checkbox, etc.)  
  - `label` - Field label text  
  - `required` - Boolean indicating if the field is mandatory

- **Submissions**: Captures submitted form data.  
  - `id` (PK) - Unique submission ID  
  - `form_id` (FK) - References `Forms(id)`  
  - `submitted_at` - Submission timestamp

- **Submission_Values**: Stores key-value pairs for submissions.  
  - `id` (PK) - Unique value ID  
  - `submission_id` (FK) - References `Submissions(id)`  
  - `field_id` (FK) - References `Fields(id)`  
  - `value` - Submitted value

**Authentication Flow**

1. **User Registration:**  
   - Users provide email and password.  
   - Passwords are hashed using bcrypt before storage.

2. **Login:**  
   - Users submit credentials.  
   - Credentials are validated against stored records.  
   - Upon success, a JWT is generated and returned.

3. **Protected Routes:**  
   - Client includes the JWT in the Authorization header.  
   - Backend verifies the JWT, granting or denying access.

4. **Token Refresh & Expiration:**  
   - Tokens have expiration times for security.  
   - Refresh tokens can be implemented for extended sessions.

These design choices ensure a scalable, secure, and maintainable application that supports robust form management, data storage, and seamless authentication.


<ul>
  <li> JWT Authentication along with Protected Routes, Refresh Tokens, reuse detection and rotation. </li>
  <li> Logout, Change password and delete account functionalities. </li>
  <li> Email sending functionality after signup and while resetting password using Nodemailer. </li>
  <li> Profile picture upload with drag n drop and crop functionality. </li>
  <li> Implemented error logging mechanisms for easier troubleshooting and maintenance. </li>
  <li> Implemented proper error handling and user feedback mechanisms. </li>
  <li> Dynamic forms can be created using different form elements by dragging and dropping. </li>
  <li> CRUD operations and search functionality on the form. </li>
  <li> Functionality to submit the form and view the responses on the form. </li>
  <li> Included various form elements like WYSIWYG editor, Calendar, Date Range Picker etc. </li>
</ul>

<h2> API </h2>

<h4> Auth </h4>
<ul>
  <li> <b>POST</b> /api/v1/auth/signup </li>
  <li> <b>POST</b> /api/v1/auth/login </li>
  <li> <b>GET</b> /api/v1/auth/refresh </li>
  <li> <b>GET</b> /api/v1/auth/logout </li>
  <li> <b>POST</b> /api/v1/auth/forgot-password </li>
  <li> <b>PATCH</b> /api/v1/auth/reset-password/:token </li>
</ul>

<h4> User </h4>
<ul>
  <li> <b>PATCH</b> /api/v1/user/change-password </li>
  <li> <b>PATCH</b> /api/v1/user/profile </li>
  <li> <b>GET</b> /api/v1/user/profile </li>
  <li> <b>DELETE</b> /api/v1/user/delete-account </li>
</ul>

<h4> Form </h4>
<ul>
  <li> <b>GET</b> /api/v1/forms?page=0&pageSize=10&sort=-name&search=form </li>
  <li> <b>GET</b> /api/v1/forms/:id </li>
  <li> <b>POST</b> /api/v1/forms </li>
  <li> <b>PATCH</b> /api/v1/forms/:id </li>
  <li> <b>PATCH</b> /api/v1/forms/bulk-delete </li>
  <li> <b>DELETE</b> /api/v1/forms/:id </li>
</ul>

<h4> Form Response </h4>
<ul>
  <li> <b>GET</b> /api/v1/forms/:id/responses </li>
  <li> <b>POST</b> /api/v1/forms/:id/responses </li>
  <li><b>GET</b> /api/v1/forms/:id/csv</li>
</ul>
