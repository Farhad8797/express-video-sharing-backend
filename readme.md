# Video sharing Platform API

A high-performance, modular RESTful API for a full-featured video sharing platform built with **Node.js**, **Express**, **TypeScript**, and **MongoDB**.

This project handles end-to-end user authentication, secure media uploads, video streaming via **ImageKit**, atomic view-rate limits using **Redis**, and transactional video/user social interactions.

---

## Features & Architecture

### Auth & Security

- **JWT Authentication:** Dual-token strategy with short-lived Access Tokens and long-lived Refresh Tokens stored in secure `HttpOnly` cookies.
- **Dedicated Refresh Pipeline:** Strict token rotation handled via a dedicated `/refresh-token` endpoint rather than inline middleware overhead.
- **Bcrypt Password Hashing:** Secure password hashing before persistence.

### Media & Video Processing

- **Multipart Media Uploads:** Handled via `multer` for streamable processing.
- **ImageKit Cloud Storage:** Integrated for hosting avatars, cover photos, video thumbnails, and high-resolution video streams.
- **Web-Optimized Playback:** Native H.264 video and AAC audio stream support with background cloud transcoding.

### Performance & Data Integrity

- **Redis Caching & Anti-Spam:** Atomic `$inc` counter logic combined with Redis temporal locks (`EX` expiration with `NX` unique flag) to prevent view-count manipulation.
- **MongoDB Aggregations:** Complex data aggregation pipelines for channel metrics, subscriber counts, and video recommendations.
- **Dockerized Infrastructure:** Local development setup powered by Docker containerization for Redis and local database orchestration.

---

## Tech Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express.js (v5)
- **Database:** MongoDB & Mongoose
- **Caching & In-Memory DB:** Redis (via Docker)
- **Media Management:** ImageKit SDK & Multer
- **Containerization:** Docker & Docker Compose

---

## Getting started

### Prequisites

- Node.js (v18+ recommended)
- Docker Desktop or Redis Server running locally
- ImageKit Account Credentials

### Clone the repo

```bash
git clone https://github.com/Farhad8797/express-social-backend.git
```

### Install the dependencies

```bash
npm install
```

### Environment Variables

Create a .env file in the root directory and populate it with your credentials:

```text
PORT=8000
MONGODB_URI=

ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=30d

IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_endpoint

REDIS_HOST=
REDIS_PORT=
```

### Start Infrastructure & Development Server

Start Redis using Docker:

```bash
docker-compose up -d
```

### Run the Server

```bash
npm run dev
```

---

## Acknowledgements

Thanks to Hitesh Chowdhury for this amazing series : [chai aur backend](https://youtu.be/EH3vGeqeIAo?si=xV4EXdgP98JaGkBM)
