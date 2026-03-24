# Azure Cloud Deployment Guide: Global Talent Portal

This guide outlines the essential steps for deploying and managing cloud resources using the Principle of Least Privilege, cost-effective modeling, and proactive monitoring.

---

## Phase 1: Governance & Security (RBAC)
**Goal:** Implement the *Principle of Least Privilege* by giving the deployment identity only the necessary permissions.

### Actions:
1. **Navigate:** Go to the [Azure Portal](https://portal.azure.com) > **Resource Groups** > Select **[Your Project Group]**.
2. **Access Control:** Select **Access Control (IAM)** > **Add** > **Add role assignment**.
3. **Role Assignment:** 
   - **Role:** Select **Contributor**.
   - **Assign access to:** User, group, or service principal (e.g., for GitHub Actions).
   - **Member:** Select your specific account or Service Principal.
   - *Why?* This allows resource creation/management without granting "Owner" rights, which prevents accidental deletion of the entire subscription.

---

## Phase 2: Cost Modeling & Benefit Analysis
**Goal:** Understand the "Burn Rate" and maintain a lean infrastructure.

### Cost-Benefit Breakdown:
- **Architecture Choice:** Using **Serverless** and **PaaS** (Platform as a Service) instead of Virtual Machines (IaaS).
- **Projected Cost:** ~$17/month for the first 1,000 users.
- **Strategic Advantage:** 
  - **Minimal Loss:** If the project is paused, costs drop to near zero.
  - **Auto-Scaling:** If traffic spikes, the architecture scales automatically without manual intervention.

---

## Phase 3: Usage & Resource Alerts
**Goal:** Detect "Hot Running" resources (e.g., spam or unexpected traffic spikes).

### Actions:
1. **Navigate:** Go to **Azure Monitor** > **Alerts**.
2. **Create Rule:** Select **+ Create** > **Alert rule**.
3. **Signal Selection:** Search for **"Percentage CPU"** (for compute) or **"Transactions"** (for storage).
4. **Condition:** Set a threshold (e.g., Trigger if **Transactions > 5,000** within 1 hour).
5. **Action Group:** Create an Action Group to send an **Email/SMS** to the lead developer immediately.

---

## Phase 4: Billing & Organization Alerts
**Goal:** Establish a "Safety Valve" to prevent unexpected monthly bills.

### Actions:
1. **Navigate:** Search for **Cost Management + Billing** in the portal search bar.
2. **Budgeting:** Go to **Budgets** > **Add**.
3. **Set Limit:** Set a monthly budget of **$25.00**.
4. **Alert Thresholds:**
   - **50% ($12.50):** Notify PM that half the budget is consumed.
   - **90% ($22.50):** Urgent warning to check for resource leaks or optimization.
   - **100% ($25.00):** Immediate review; consider pausing non-critical services.

---

## Phase 5: Shipping the MVP
**Goal:** Automate deployment for consistency and reliability.

### Workflow:
- **CI/CD:** Use **GitHub Actions** to trigger deployments on every code push.
- **Staging:** Always deploy to a **"Staging" slot** first to verify changes.
- **PM Golden Rule:** *"Never ship directly to production on a Friday afternoon!"*
