# Event-Management

A simple RESTful API built with Node.js, Express, PostgreSQL for managing users, events, and registrations.

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone Nikhil4002-50-82/Event-Management
cd Nikhil4002-50-82/Event-Management/server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the `server` folder with the following content:

```
host=localhost
user=username
password=password
database=Event-Management
```

> Make sure PostgreSQL is running and the `Event-Management` database exists.

### 4. Start the Server

```bash
npm start
```

The server will run at `http://localhost:5000`.

---

##API Endpoints

| Method   | Endpoint             | Description                                                               |
| -------- | -------------------- | ------------------------------------------------------------------------- |
| `POST`   | `/createTables`      | Creates `users`, `events`, and `registrations` tables                     |
| `POST`   | `/createUsers`       | Add a new user with `name` and `email`                                    |
| `POST`   | `/createEvents`      | Add a new event using `title`, `date`, `time`, `location`, and `capacity` |
| `POST`   | `/registerEvent/:id` | Register a user (`userId`) for an event by event `:id`                    |
| `GET`    | `/event/:id`         | Fetch event details and list of registered users                          |
| `GET`    | `/upcomingEvents`    | List all upcoming events sorted by date                                   |
| `DELETE` | `/cancelEvent/:id`   | Cancel a user's registration (`userId`) for event `:id`                   |
| `GET`    | `/eventStats/:id`    | Get stats for an event like total registrations, remaining capacity       |

---

## Sample Request Formats

### Create a User

```json
POST /createUsers
{
  "name": "Alice",
  "email": "alice@example.com"
}
```

### Create an Event

```json
POST /createEvents
{
  "title": "Tech Conference",
  "date": "2025-08-25",
  "time": "10:00",
  "location": "Bangalore",
  "capacity": 150
}
```

### Register a User to Event

```json
POST /registerEvent/1
{
  "userId": 2
}
```

### Cancel a Registration

```json
DELETE /cancelEvent/1
{
  "userId": 2
}
```

---

## Technologies Used

* Node.js
* Express
* PostgreSQL
* dotenv
* body-parser
* morgan
* cors

---

## Contact

Maintained by Nikhil R Nambiar.
