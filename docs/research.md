# Research Report: Multi-User Business Platform (SaaS)

## 1. Introduction

A **SaaS (Software as a Service)** platform is a way to let many different companies use the same software over the internet. In this project, these companies are called **"tenants."**

The biggest challenge is making sure that even though everyone uses the same system, Company A can never see Company B’s private data. This is called **Multi-Tenancy**. We need to build a system that is safe, fast, and doesn't cost a fortune to run.

Our goal is to create a project management tool where different organizations can manage their own teams and tasks in total privacy.

---

## 2. Three Ways to Organize the Data



### 2.1 One Big Room (Shared Database & Shared Schema)
Imagine a large filing cabinet where everyone’s folders are stored together. To keep things organized, every single piece of paper has the Company’s Name (Tenant ID) written at the top.

* **Pros:** Very cheap to run and easy to set up.
* **Cons:** The software must be very careful to only show users the files with their specific "Name" on them.

### 2.2 Separate Folders (Shared Database & Separate Schema)
This is like having one filing cabinet, but every company gets its own private drawer. 

* **Pros:** It’s harder to accidentally see someone else's data.
* **Cons:** It becomes a lot of work to manage as you add hundreds of companies.

### 2.3 Separate Cabinets (Separate Database per Tenant)
Every company gets its own physical filing cabinet in its own room.

* **Pros:** The most secure way to do it.
* **Cons:** Very expensive and takes a lot of effort to maintain.

---

## 3. Comparison at a Glance

| Feature | One Big Room (Shared) | Separate Folders | Separate Cabinets |
| :--- | :--- | :--- | :--- |
| **Safety** | Good | Better | Best |
| **Price** | Cheapest | Medium | Expensive |
| **Ease of Growth** | Very Easy | Medium | Hard |
| **Best For** | Startups & New Apps | Growing Businesses | Huge Corporations |

---

## 4. The Path We Chose: "One Big Room" (Shared Schema)

We decided to use the **Shared Database + Shared Schema** approach.

**Why?**
1. **Saving Money:** It’s the most cost-effective way to start.
2. **Simplicity:** It makes it much easier to run the app using Docker and allows us to update the system for everyone at once.
3. **Speed:** It’s very fast to set up for new users.

To keep it safe, we will make sure our code automatically checks the "Tenant ID" on every single request so data never leaks.

---

## 5. The Tools We Are Using

* **Backend (The Brains):** Node.js & Express. It’s fast, modern, and handles many users at once very well.
* **Frontend (The Look):** React.js. This makes the website feel smooth and easy for people to use.
* **Database (The Storage):** PostgreSQL. A very reliable "digital filing cabinet" that is great at keeping data organized.
* **Security (The Lock):** JWT. A digital "badge" that users carry around once they log in so the system knows who they are.
* **Shipping (The Box):** Docker. This ensures the app runs perfectly on any computer.

---

## 6. Keeping Things Safe

We are taking several specific steps to protect user data:
1. **Secret Passwords:** We never save plain passwords; we scramble them into unreadable code using bcrypt.
2. **Digital Badges:** We use expiring "tokens" (JWT) so users stay logged in securely.
3. **Permissions:** A "Staff" member won't be able to see or change "Admin" settings.
4. **Invisible Walls:** Our code will always double-check that you only see data belonging to your own company.
5. **Clean Inputs:** We block hackers from trying to type "tricky" code into our forms.
6. **Activity Logs:** We keep a record of important changes so we know who did what and when.
7. **Secure Setup:** We keep our "master keys" (passwords) in a separate secure place, not inside the code.

---

## 7. Conclusion

This plan gives us a solid start. By using a shared system, we keep costs low and the setup simple, while our security rules keep every company’s data private and safe. It’s a professional way to build a modern business app.