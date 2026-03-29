# Microservices Lorry Sales System - Assignment Guide

This guide summarizes your progress and provides the necessary details for your assignment submission.

## 1. Microservices Elaboration
Here is a breakdown of the microservices implemented in your system:

| Service | Responsibility |
| :--- | :--- |
| **Auth Service** | Handles user registration, authentication, and JWT token issuance with Role-Based Access Control (RBAC). |
| **Customer Service** | Manages shop owner profiles, registration, and credit limit allocations. |
| **Finance Service** | Tracks all financial transactions, including lorry expenses and daily profit calculations. |
| **Fleet Service** | Manages the fleet of lorries, sales representative assignments, and stock loading/returns for each trip. |
| **Inventory Service** | Manages the central warehouse stock, product catalog, and records of damaged/returned goods. |
| **Sales Service** | Processes orders, generates invoices, handles billing, and updates transaction history. |
| **API Gateway** | The single entry point for all clients. It handles request routing, security (JWT verification), and RBAC enforcement. |

## 2. API Gateway Role
The API Gateway is a critical component that solves the following problems:
*   **Single Entry Point:** Clients only need to know one URL (the gateway) instead of multiple service URLs.
*   **Port Management:** It avoids exposing multiple ports (5001-5006) to the public. The gateway runs on port 80 and routes traffic internally.
*   **Security:** It centralizes authentication and authorization. Instead of each service checking the JWT, the gateway does it once and passes validated user info to downstream services.
*   **Protocol Translation/Routing:** It can route based on paths (e.g., `/sales` -> `SalesService`).

## 3. How to Run and Get Screenshots

To fulfill the "Evidence" requirement of your assignment, follow these steps:

### Step 1: Start the System
Open your terminal in the root directory and run:
```bash
docker-compose up --build
```

### Step 2: Native Swagger Screenshots
Capture screenshots of each service's individual Swagger UI:
*   **Inventory:** `http://localhost:5001/api-docs`
*   **Fleet:** `http://localhost:5002/api-docs`
*   **Customer:** `http://localhost:5003/api-docs`
*   **Sales:** `http://localhost:5004/api-docs`
*   **Finance:** `http://localhost:5005/api-docs`
*   **Auth:** `http://localhost:5006/api-docs`

### Step 3: Gateway Swagger Screenshots
Capture screenshots of the same services accessed through the Gateway:
*   **Auth (via Gateway):** `http://localhost/auth/api-docs`
*   **Inventory (via Gateway):** `http://localhost/inventory/api-docs`
*   **Sales (via Gateway):** `http://localhost/sales/api-docs`
*   **Finance (via Gateway):** `http://localhost/finance/api-docs`
*   **Fleet (via Gateway):** `http://localhost/fleet/api-docs`
*   **Customer (via Gateway):** `http://localhost/customer/api-docs`

## 4. Final Checklist for Submission
*   [x] **Proper Folder Structure:** Every service is in its own directory with a consistent layout.
*   [x] **API Gateway:** Implemented and functional on port 80.
*   [x] **No Build Breaks:** Ensure `docker-compose` builds successfully.
*   [ ] **Slide Deck:** Use the descriptions in Section 1 and screenshots from Section 3.
