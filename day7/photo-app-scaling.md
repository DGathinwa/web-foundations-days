Markdown
# SnapShare: System Design & Scaling Plan

## 1. Assumptions & Load Estimates
* **Registered Users:** 10,000,000
* **Daily Active Users (DAU):** 10% of 10M = 1,000,000 DAU
* **Time:** ~100,000 seconds per day (for easy estimation)

**Traffic Estimates:**
* **Uploads (Writes):** 1M DAU × 1 photo = 1,000,000 uploads/day. 
  * Average: ~10 uploads/sec. 
  * Peak (5×): ~50 uploads/sec.
* **Feed Views (Reads):** 1M DAU × 50 views = 50,000,000 views/day. 
  * Average: ~500 views/sec. 
  * Peak (5×): ~2,500 views/sec.

**Storage Estimates:**
* **Per Photo:** 2 MB original + 50 KB thumbnail = 2.05 MB.
* **Per Day:** 1,000,000 photos × 2.05 MB = 2,050,000 MB (~2.05 TB / day).
* **Per Year:** 2.05 TB × 365 = ~750 TB per year.

## 2. System Paradigm
This system is overwhelmingly **Read-Heavy**. With 50 feed views for every 1 photo upload, the read-to-write ratio is 50:1. The architecture must heavily prioritize read replicas and caching layers (CDNs and Redis) to protect the primary database from the 2,500/sec peak read load.

## 3. Handling Binary Data (Photos)
Photos should **never** be stored directly inside the SQL database. Storing large binary files (BLOBs) in a relational database bloats the database size, makes backups agonizingly slow, and ruins replication performance. Instead, photos must be saved to a cheap, infinitely scalable **Object Storage** service (like Amazon S3), while the database only stores the lightweight text URL pointing to that file.

## 4. Architecture Diagram
text
[ DNS ]
|
[ CDN (Images, HTML/JS) ]
| (API calls bypass CDN)
[ Load Balancer ]
/      |      

[ App 1 ] [ App 2 ] [ App 3 ] ---> [ Cache (Redis) ]
|         |         |                (Feeds)
|writes   |reads    |jobs
v         v         v
[ Primary ]  [ Read   ]   [ Queue ] ---> [ Worker ]
[   DB    ]->[ Replicas ]                  |
|                                      | generates thumb
| saves original                       | saves thumb
v                                      v
[       Object Storage (AWS S3)                 ]


## 5. Component Roles
* **DNS:** Translates the `snapshare.com` domain name into an IP address.
* **CDN:** Caches static UI files and the photo image files at edge servers globally to minimize latency.
* **Load Balancer:** Distributes the 2,500 peak incoming requests evenly across the app servers to prevent overload.
* **App Servers:** Stateless machines executing the core API and business logic.
* **Cache (Redis):** Stores pre-computed user feeds in ultra-fast RAM to avoid querying the database on every feed load.
* **Primary DB:** The single source of truth that safely executes all `INSERT` and `UPDATE` operations.
* **Read Replicas:** Copies of the primary database dedicated solely to handling the massive volume of `SELECT` queries.
* **Object Storage:** Specialized, cheap, flat file storage designed to hold petabytes of raw photo files.
* **Queue & Worker:** The queue holds pending tasks, while dedicated worker servers asynchronously process heavy jobs (like resizing thumbnails) without slowing down the web app.

## 6. The Upload Flow (Step-by-Step)
1. The user uploads a 2MB photo; the Load Balancer routes the request to an App Server.
2. The App Server instantly streams the 2MB file to Object Storage (S3).
3. The App Server writes a new row to the Primary DB containing the photo's metadata and S3 URL.
4. The App Server drops a JSON message into the Queue (`{"task": "thumbnail", "photo_id": 123}`) and immediately responds `201 Created` to the user.
5. In the background, a Worker server pulls the message from the Queue, downloads the 2MB photo, compresses it into a 50KB thumbnail, saves the thumbnail to Object Storage, and updates the database row with the new thumbnail URL.

## 7. Architectural Trade-offs
1. **Freshness vs. Speed (The Cache Tax):** By aggressively caching the feeds in Redis, we achieve massive throughput and near-zero latency, but we accept *eventual consistency*. A user might upload a photo, and their follower might not see it in their feed for a few seconds until the cache invalidates.
2. **Simplicity vs. Responsiveness (The Message Queue):** Adding a message queue and separate worker servers significantly increases the complexity of our infrastructure (more things to monitor, deploy, and fix). However, it is a mandatory trade-off to keep the application responsive; without it, users would stare at a frozen loading screen while the app server struggled to compress a 2MB image.