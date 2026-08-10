# **Product Requirements Document(PRD)**

## Product 

	Urban Company-One-Click Rebooking 

## Document Information 

| Field | Details |
| :---- | :---- |
| Product  | Urban Company One-Click-Rebooking |
| Version | 1.0 |
| Author | Steve,Rishit,Swetha |
| Date | August 5th 2026 |
| Status | Pending |
| Tech Stack  | [Next.js](http://Next.js), PostgreSQL, Flutter, Prisma, GCP, GitHub Actions |

## Index

1. Executive Summary  
2. Background  
3. Problem Statement  
4. Product Vision  
5. Objectives  
6. Scope  
7. User Persona  
8. User Journey   
9. User Stories  
10. Functional Requirements  
11. Non-Functional Requirements  
12. API Requirements   
13. Data Requirements   
14. Dependencies  
15. Edge Cases  
16. Risks  
17. Success Metrics  
18. Acceptance Criteria  
19. Future Requirements  
20. MVP Definition

## 1\. Executive Summary

Urban Company serves millions of customers who frequently book recurring services such as home cleaning, salon appointments, appliance repair, plumbing, and electrical work. While customers often prefer booking the same professional again, the current booking process requires them to manually search for the professional, re-enter service details, select a time slot, and complete the booking from scratch.

The proposed **One-Click Rebooking** feature simplifies this experience by allowing customers to rebook a previously completed service with minimal effort. The system automatically retrieves customer details, previous booking information, and the professional's availability in parallel, enabling faster bookings while maintaining accuracy.

The feature aims to improve customer convenience, increase repeat bookings, and enhance professional utilization without introducing major changes to the existing booking flow.

## **2\. Background**

Urban Company has a large number of customers who regularly book the same services. Internal observations indicate that customers often prefer returning to professionals they already trust.

However, the existing booking process requires several manual steps:

* Searching for the service again  
* Selecting a preferred professional  
* Choosing a time slot  
* Re-entering booking details  
* Confirming payment  
  This repetitive process increases booking time and may discourage repeat bookings. Customers also experience frustration when their preferred professional is unavailable, requiring them to restart the selection process.  
  A streamlined rebooking experience can reduce user effort, improve satisfaction, and encourage repeat service usage.

## 3\. Problem Statement

Customers who want to book the previously completed service must repeat the entire booking process, even when they intend to hire the same professional. This results in longer booking times, unnecessary interactions, and a poor user experience.

Urban Company requires a One-Click-Rebook mechanism that:

* Creates a new booking using an existing booking as a reference.  
* Automatically retrieves customer details and booking history in parallel.  
* Displays the selected professional's calendar with blocked and available slots.  
* Suggests alternative professionals if the original professional is unavailable. 

## 4\. Product Vision

Enable customers to complete repeat bookings with seconds while ensuring professionals receive bookings based on their real time availability.

## 5\. Objectives

### 5.1 Business Objectives

* Increase repeat booking rate.  
* Improve customer retention.  
* Reduce booking abandonment.  
* Increase professional utilization.  
* Improve overall customer satisfaction.

### 	5.2 Engineering Objectives

* Reduce booking response time.  
* Enable parallel API execution.  
* Maintain high availability.  
* Support future recurring booking functionality.

### 	5.3 User Objectives

* Book a previous service in one click.  
* Reuse previous booking details.  
* Select convenient time slots quickly.  
* Continue booking even if the previous professional is unavailable.

## 6\. Scope

### 6.1 In Scope

* Booking History screen  
* Rebook button  
* Customer detail auto-fill  
* Previous service auto-selection  
* Parallel loading of booking history and customer profile  
* Professional availability calendar  
* Alternative professional suggestion  
* Booking confirmation


### 	6.2 Out of Scope

* Recurring bookings  
* AI-based professional recommendations  
* Subscription plans  
* Dynamic pricing  
* Voice booking

## 7\. User Personas

### 7.1 Persona 1 – Customer

**Name:** Suresh

Age: 58

Occupation: Retired officer

Goals:

* Book car cleaning every week.  
* Save time.  
* Prefer trusted professionals.  
  Pain Points:  
* Re-entering booking details.  
* Searching for professionals repeatedly.

  ### 7.2 Persona 2 – Professional

  **Name:** Teja  
  Occupation: Car Cleaning Professional  
  Goals:  
* Manage appointments efficiently.  
* Avoid double bookings.  
* Keep the calendar updated.

Pain Points:

* Schedule conflicts.  
* Last-minute cancellations.


## 8\. User Journey

### 8.1 Current Flow

Login

↓

Search Service

↓

Select Service

↓

Search Professional

↓

Choose Slot

↓

Enter Address

↓

Payment

↓

Booking Complete

### 

### 8.2 Proposed Flow

	  
	Login  
↓

Booking History  
↓  
Click Rebook

↓

Load Data in Parallel

↓

Display Calendar

↓

Select Slot

↓

Confirm Booking

↓

Booking Complete

## 9\. User Stories

### 9.1 US-1

As a customer,

I want to rebook a previous service, so that I don't repeat the booking process.

---

### 9.2 US-2

As a customer,

I want my previous address to be automatically selected, so that I can book faster.

---

### 9.3 US-3

As a customer,

I want to view my previous booking details before confirming.

## 10\. Functional Requirements

### 10.1 FR-001 Booking History

The application shall display all completed bookings.

Information displayed:

* Service Name  
* Professional  
* Booking Date  
* Price  
* Rating  
* Rebook Button  
  ---

  ### 10.2 FR-002 Rebook Button

  Clicking Rebook shall initiate a new booking.  
  ---

  ### 10.3 FR-003 Parallel Data Loading

  The system shall simultaneously fetch:  
* Customer Profile  
* Previous Booking  
* Professional Details  
* Calendar Availability  
  using asynchronous requests.  
  ---

  ### 10.4 FR-004 Professional Calendar

  Display:  
* Available slots  
* Booked slots  
* Blocked slots  
  ---

  ### 10.5 FR-005 Booking Creation

  Create a new booking using:  
* Previous service  
* Previous address  
* Selected slot  
  Generate a new Booking ID.  
  ---

  ### 10.6 FR-006 Alternate Professional

  If unavailable, Show: "Your previous professional is unavailable.", Suggest similar professionals.  
  ---

  ### 10.7 FR-007 Notifications

  After successful booking:  
  Customer receives:  
* Push Notification  
* Email  
* SMS  
  Professional receives:  
* Booking notification


## 11\. Non-Functional Requirements

### 11.1 Performance

             
             Booking History

         	   	≤ 2 seconds

             Calendar

           		 ≤ 1 second

            Booking Confirmation

            	≤ 3 seconds

###              **11.2 Reliability**  

                       99.9% uptime   
                     

###            11.2 Security

* OAuth Authentication  
* Encrypted customer data  
* Secure payment handling

### 11.3 Availability 

                   The system should remain operational during peak booking hours. 

## **12\. API Requirements**

### **12.1 Service Booking**

1. GET /bookings/history  
   Returns all completed bookings  
     
2. POST /bookings/rebook  
   Creates a new booking  
   

### 

### **12.2 Customer Service**

1. **GET /customer/profile**  
2. Returns customer details

### **12.3 Professional service**

1. **GET /professional/{id}/availability**  
   Returns available slots

### **12.4 Notification Service**

1. **POST /notifications/send**  
   Sends booking confirmation  
   

## **13\. Data Requirements** 

### **13.1 Existing Tables** 

* User  
* Booking   
* Professional  
* Service  
* Payment   
* Address


  ### **13.2 New fields**

   **Booking** 

     

*  parentBookingId  
*   rebookedFrom  
*   bookingSource


**Professional Availability**

* professionalId  
* date  
* startTime  
* endTime  
* Status

###            **13.3 Status:**

* Available  
* Booked  
* Blocked

## **14\. Dependencies**

This feature depends on

- Booking services  
- Customer services  
- Calendar management  
- Payment portal  
- Notifications  
- Authentication

## **15\. Edge Cases**

| Scenario | Expected Behavior |
| ----- | ----- |
| Professional unavailable | Suggest alternatives |
| Service discontinued | Show error message |
| Address deleted | Ask user to choose another address |
| Slot booked by another customer | Ask to book a different slot |
| Payment failure | Request to retry payment |
| Customer cancels | Booking cancelled, and deleted from professional calender |
| Network timeout | Retry API request |
| Duplicate booking request | Prevent duplicate booking creation |

### 

## **16\. Risks**

| Risk | Mitigation |
| ----- | ----- |
| Calendar synchronization issues | Real-time slot locking |
| High API latency | Parallel API calls and caching |
| Double bookings | Database transaction locking |
| Heavy traffic during peak hours | Horizontal scaling and load balancing |

## 17\. Success Metrics

| KPI | Target |
| ----- | ----- |
| Average Booking Time | \<30 sec |
| Booking Failure Rate | \<2% |

## **18\. Acceptance Criteria**

### **18.1 Scenario 1**

**Given** that the customer has a previous completed booking  
**When** the customer clicks Rebook  
**Then** the system loads previous booking details and customer information automatically.

### **18.2 Scenario 2**

**Given** the professional is available  
**When** the customer selects a slot  
**Then** the booking is confirmed successfully.

### **18.3 Scenario 3**

**Given** the professional is unavailable  
**When** the customer attempts to rebook  
**Then** alternative professionals are displayed.

### **18.4 Scenario 4**

**Given** the selected slot becomes unavailable during checkout  
**When** booking is confirmed  
**Then** the system prompts the customer to choose another available slot.

## **19\. Future Enhancements**

* AI-powered professional recommendations based on ratings and preferences.  
* One-tap recurring bookings (weekly/monthly).  
* Smart reminders for repeat services.  
* Dynamic slot recommendations based on user behavior.  
* Loyalty rewards for repeat bookings.

## **20\. MVP Definition**

**The MVP will include:**

* Booking History  
* One-Click Rebook button  
* Parallel loading of customer details and booking history  
* Professional calendar with blocked and available slots  
* Booking confirmation  
* Alternative professional suggestions  
* Notifications to both customer and professional  
* **Product Recommendations:** The future enhancements section provides a solid starting point for proposing AI-based recommendations, recurring bookings, and personalization features.

