# Ride system SQL schema (WayGo)

Run the migration file in Supabase SQL Editor:

`supabase/migrations/20260519100000_rides_routes_admin_system.sql`

## New / updated objects

### Enums
- `route_category`: `normal` | `religious`
- `fleet_owner_type`: `vendor` | `admin`

### `routes` (altered)
| Column | Type | Notes |
|--------|------|-------|
| route_category | route_category | default `normal` |
| owner_type | fleet_owner_type | default `vendor` |

Admin routes: `vendor_id IS NULL`, `owner_type = 'admin'`.

### `taxis` (altered)
| Column | Type | Notes |
|--------|------|-------|
| owner_type | fleet_owner_type | default `vendor` |

### `taxi_rides` (new)
Published taxi rides shown in customer search.

| Column | Type |
|--------|------|
| id | uuid PK |
| vendor_id | uuid → vendors (nullable) |
| owner_type | fleet_owner_type |
| taxi_id | uuid → taxis |
| route_id | uuid → routes |
| driver_id | uuid → drivers |
| from_city, to_city | text |
| travel_date | date |
| departure_time | text |
| price | numeric |
| seats_available | int |
| status | open \| full \| cancelled \| completed |

### `sharing_rides` (altered)
| Column | Type |
|--------|------|
| owner_type | fleet_owner_type |
| vendor_id | uuid |
| travel_date | date |

Shared taxi search only shows rides whose route has `route_category = 'religious'`.

### `admin_section_seen` (new)
Tracks when admin last viewed a section (clears red badge).

| Column | Type |
|--------|------|
| admin_user_id | uuid PK (with section) |
| section | vendors \| users \| drivers \| bookings \| refunds |
| last_seen_at | timestamptz |

## Customer search priority
1. **Taxi**: `taxi_rides` with `owner_type = vendor` first; if none match, `owner_type = admin`.
2. **Shared taxi**: `sharing_rides` joined to religious routes only.
3. **Bus**: still uses demo data until bus publish is implemented.

## Booking links
`bookings` already supports `route_id`, `taxi_id`, `sharing_ride_id`, `coupon_id`, `discount_amount`.
