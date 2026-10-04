#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================
user_problem_statement: "Kalakriti Studios - DB-driven handmade art e-commerce (Next.js 15 App Router + TS, Neon Postgres + Prisma, Auth.js Google-only, Cloudinary, Netlify). Admin edits must appear on refresh without redeploy. 3 homepage categories: Hand Craft Design, Rakhi, Handmade Portrait & Designs."

backend:
  - task: "Admin authorization on all /api/admin/* (401 anon, 403 customer, 200 admin)"
    implemented: true
    working: true
    file: "lib/authz.ts, app/api/admin/**"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        - working: true
          agent: "main"
          comment: "Role re-read from DB each request. Verified with curl."
        - working: true
          agent: "testing"
          comment: "✅ PASSED - All authorization tests passed: 401 without auth, 403 with customer cookie, 200 with admin cookie. Tested on /api/admin/products endpoint."
  - task: "Products CRUD (POST/GET list, GET/PUT/PATCH/DELETE by id) with images, tags, slug uniqueness, offer<=mrp validation"
    implemented: true
    working: true
    file: "app/api/admin/products/route.ts, app/api/admin/products/[id]/route.ts, lib/product-service.ts"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        - working: true
          agent: "main"
          comment: "Create + update verified; public page reflects updates immediately."
        - working: true
          agent: "testing"
          comment: "✅ PASSED - Full CRUD tested: POST creates product (201), GET retrieves (200), PUT updates (200), PATCH quick update (200), DELETE removes (200). Product appears in public API immediately after creation. Updates (name, price, stock) appear in public API after PUT. Unpublishing removes from public API. Validation working: offer>MRP returns 422, foreign image URL returns 422, duplicate code returns 409."
  - task: "Categories CRUD, Tags CRUD, Settings GET/PUT"
    implemented: true
    working: true
    file: "app/api/admin/categories/**, app/api/admin/tags/**, app/api/admin/settings/route.ts"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        - working: "NA"
          agent: "main"
          comment: "Implemented"
        - working: true
          agent: "testing"
          comment: "✅ PASSED - Categories: GET lists all (200), POST creates (201), PUT updates (200), DELETE removes (200). Tags: GET lists all (200), POST creates (201), PUT updates (200), DELETE removes (200). Settings: GET retrieves (200), PUT updates WhatsApp number successfully (200), settings restored to original values. Minor: WhatsApp validation allows empty string when invalid input is transformed."
  - task: "Cloudinary signed upload signature (admin only) + direct upload"
    implemented: true
    working: true
    file: "app/api/admin/upload-signature/route.ts, lib/cloudinary.ts"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        - working: true
          agent: "main"
          comment: "Signed upload to Cloudinary verified via curl."
        - working: true
          agent: "testing"
          comment: "✅ PASSED - Upload signature endpoint returns 401 without auth, 200 with admin auth. Response contains all required fields: timestamp, folder, signature, apiKey, cloudName. Cloud: uhqsdfgy, Folder: kalakriti/products."
  - task: "Public: /api/products search/filter/sort, SSR pages reflect DB changes, 404s, sitemap/robots, JSON-LD"
    implemented: true
    working: true
    file: "app/api/products/route.ts, lib/queries.ts, app/(site)/**, app/sitemap.ts, app/robots.ts"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        - working: true
          agent: "main"
          comment: "Basic checks done"
        - working: true
          agent: "testing"
          comment: "✅ PASSED - Public products API: search by name works (q=rakhi returned 8 products), category filter works (category=rakhi), stock filter works (stock=IN_STOCK), sorting works (price_asc sorts correctly), pagination works (page=1&pageSize=5). Public pages: / (200), /shop (200), /category/rakhi (200), /category/hand-craft-design (200), /category/handmade-portrait-designs (200), /category/nope (404), /sitemap.xml (200), /robots.txt (200). DB changes appear immediately in public API."

metadata:
  created_by: "main_agent"
  version: "1.0"
  test_sequence: 2
  run_ui: false

test_plan:
  current_focus: []
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
    - agent: "main"
      message: "See testing task message for auth cookie instructions. Do NOT delete the 7 real rakhi products (codes KS-RK-001..007) or the 3 categories; clean up anything you create."
    - agent: "testing"
      message: "Backend testing complete. 40/41 tests passed. All critical functionality working: authorization, CRUD operations, validation, public API, search/filter/sort, pagination, public pages. One minor validation issue: WhatsApp validator allows empty string when invalid input is transformed (by design). All test resources cleaned up. No real products or categories were modified."
