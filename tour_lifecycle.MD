[1] Basic Info
        ↓
[2] Itinerary
        ↓
[3] Pricing
        ↓
[4] Schedule
        ↓
[5] Review → Submit
step 1-basic infor API
1.create draft tour

POST /api/merchant/tours
request
{
  "title": "3 Days Paris Family Tour",
  "destination_country": "France",
  "destination_city": "Paris",
  "duration_days": 3,
  "departure_city": "London",
  "category": "family",
  "tags": ["family", "europe"],
  "short_description": "Perfect family trip in Paris",
  "long_description": "Full detailed description...",
  "cancellation_policy": "Free cancellation 7 days before",
  "included_services": ["Hotel", "Breakfast", "Transport"],
  "excluded_services": ["Flights"]
}
response
{
  "id": "tour_123",
  "status": "DRAFT",
  "step_completed": 1
}

2.update basic info
PUT /api/merchant/tours/{id}/basic

2-Itinerary API
PUT /api/merchant/tours/{id}/itinerary
request
{
  "days": [
    {
      "day_number": 1,
      "title": "Arrival & City Tour",
      "summary": "Welcome to Paris",
      "activities": [
        {
          "name": "Eiffel Tower",
          "description": "Visit the Eiffel Tower",
          "duration_hours": 2
        }
      ],
      "hotel": {
        "name": "Hilton Paris",
        "room_type": "Standard"
      },
      "meals": ["dinner"],
      "transport": {
        "type": "bus",
        "details": "Airport pickup"
      }
    }
  ]
}

response
{
  "message": "Itinerary saved",
  "step_completed": 2
}
3-Pricing API
PUT /api/merchant/tours/{id}/pricing
{
  "currency": "EUR",
  "adult_price": 500,
  "child_price": 350,
  "single_supplement": 120,
  "tier_pricing": [
    {
      "min_people": 1,
      "max_people": 2,
      "price": 520
    }
  ],
  "seasonal_pricing": [
    {
      "start_date": "2026-06-01",
      "end_date": "2026-08-31",
      "adult_price": 600
    }
  ]
}

{
  "message": "Pricing updated",
  "estimated_commission": 50,
  "step_completed": 3
}
4-Schedule & Inventory API

PUT /api/merchant/tours/{id}/departures

{
  "departures": [
    {
      "departure_date": "2026-07-01",
      "min_group_size": 5,
      "max_group_size": 20,
      "total_seats": 20,
      "booking_deadline_days": 3
    }
  ]
}

{
  "message": "Departure schedule saved",
  "step_completed": 4
}

Step 5 — Submit API
POST /api/merchant/tours/{id}/submit
{
  "status": "SUBMITTED",
  "message": "Tour submitted for review"
}
Status = REJECTED

(DRAFT
SUBMITTED
UNDER_REVIEW
REJECTED
APPROVED
ONLINE
OFFLINE
)


Smart Improvement (Professional Tip)
GET /api/merchant/tours/{id}/progress
response
{
  "basic_completed": true,
  "itinerary_completed": true,
  "pricing_completed": true,
  "schedule_completed": false,
  "completion_percentage": 75
}
