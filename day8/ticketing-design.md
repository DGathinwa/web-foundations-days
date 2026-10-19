Markdown
# TicketHub: System Design & Scaling Plan

## 1. Context and Goals
* **Context:** TicketHub is an event ticketing platform where users can browse concerts and purchase specific seats. 
* **Goals:** To handle massive, sudden spikes in traffic during popular concert sales without crashing, and to absolutely guarantee that no seat is sold twice.
* **Non-Goals:** We are not designing the physical ticket printing system or the frontend UI rendering for the seating chart.

## 2. Requirements & Estimates
**Functional Requirements:**
* Browse upcoming events.
* View available seats for an event.
* Hold a seat (lock it for 5 minutes to complete payment).
* Complete payment and view purchased tickets.

**Non-Functional Requirements:**
* **Fairness/Correctness (Strict Consistency):** A seat cannot be double-booked under any circumstances.
* **High Availability for Reads:** The site must stay online when 200,000 people hit refresh simultaneously.

**Traffic Estimates:**
* **Normal Day:** 50,000 visitors × 10 pages = 500,000 views/day (~6 reads/sec). 5,000 tickets sold = ~0.05 writes/sec.
* **Peak Spikes (The "Big Sale"):** 200,000 people hit the site in 10 minutes (600 seconds). 
  * *Peak Reads:* If everyone refreshes 5 times, that's 1,000,000 reads in 600s = **~1,600 reads/sec**.
  * *Peak Writes (Attempts):* 200,000 people trying to lock 20,000 seats = **~333 locking attempts/sec**.

## 3. API Design
| Method | Path | Description |
|---|---|---|
| `GET` | `/events` | List upcoming concerts. |
| `GET` | `/events/{id}/seats` | View seat map and availability for an event. |
| `POST` | `/seats/{id}/hold` | Temporarily reserve a seat (starts 5-min timer). |
| `POST` | `/orders` | Submit payment for held seats. |
| `GET` | `/users/{id}/tickets` | View purchased tickets. |

## 4. Data Model
**Tables:**
1. **`users`** (id, email, password_hash)
2. **`events`** (id, name, date, venue)
3. **`seats`** (id, event_id, seat_number, status [available, held, sold], user_id, hold_expires_at)
4. **`orders`** (id, user_id, total_price, status, created_at)

**Preventing Double-Booking (Concurrency Control):**
To prevent two users from buying the same seat at the exact same millisecond, we rely on the relational database's ACID properties. We use an atomic SQL `UPDATE` statement:
`UPDATE seats SET status = 'held', user_id = 99 WHERE id = 123 AND status = 'available';`
If two app servers run this simultaneously, the database strictly queues them. The first one succeeds (returns 1 affected row). The second one fails (returns 0 affected rows because the status is no longer 'available'), and the app server safely returns a `409 Conflict` (Seat already taken) to the second user.

## 5. Architecture
text
[ DNS ]
|
[ CDN (Event Images, UI) ]
|
[ Load Balancer ]
/             

[ App Server 1 ] [ App Server 2 ] ---> [ Cache (Redis) ]
|               |
writes          reads
|               |
v               v
[ Primary DB ] -> [ Read Replica ]
|
[ Message Queue ]
|
[ Worker Server ] (Email confirmations & expiring old holds)

**Surviving the Big Sale:** 
When 200,000 people refresh the event page, the Load Balancer spreads the traffic. The App Servers immediately fetch the event details and seat availability from the **Redis Cache**. This shields the Primary Database from the 1,600 reads/sec. The Primary DB *only* processes the exact write requests to hold or buy a seat, keeping it fast and responsive.

## 6. Trade-offs
1. **Consistency over Availability:** By enforcing strict atomic locks on the `seats` table, we trade away some availability. If the database is slightly overloaded, a user's request to lock a seat might timeout. We accept this because double-billing a user for a seat they didn't get is catastrophic for a ticketing business.
2. **Eventual Consistency in Seat Maps:** Because the seat map is served from the Redis Cache (and updated read replicas), a user might see a seat as "available" on their screen, but when they click it, it fails because someone else locked it 200ms ago. We trade perfect UI accuracy for the ability to survive 200,000 concurrent visitors.