## Guidlines for the App design and story

The current file contains guidelines on what the app does and details of how to wire it

### Entry Point of the App
Login is the entry point of the app, where an otp is used, this is for now circumvented using a 
dummy otp and any login, to work on the main app

### NavigationBar
NavigationBar should contain:
    * LivePlanScreen 
    * PlansScreen (default)
    * MapsScreen
    * ProfileScreen

### ProfileScreen

- The ProfileScreen contains:
    * background image
    * profile picture
    * a recent Events that just show if the person recently organized an event and/or participated 
    events
        * limit this to 3 events (like list)
    * Organize Plan Button

Profile -> CreateEventScreen (via Organize Plan Button)

### PlansScreen

- The PlansScreen contains:
    * Plans partition that contains subscribed Plans (can be Outings or Events)
        * Plans partition has Plans that are rectangles with a picture (or a color) 
        when clicked takes you to PlanScreen
    * Groups partition (related to Plans)
        * Groups partition has Groups that are related 1-1 with a particular plan, where participants
        can talk with each other
    * A search bar that searches for Events by name, and when the events show up in the search, 
    they should have a approximate date and location and a small icon that would've been preconfigured
    in CreatePlanScreen
    * Pressing on one here, takes you to the PlanScreen where it greys out anything relating to 
    payment or ordering cards, and only allows to join event (add it to your PlansScreen) or just
    browse it 
    
PlansScreen -> PlanScreen (via clickable plan rectangles in Plans partition of PlansScreen or
via plan in seaarch of PlansScreen)
PlansScreen -> GroupScreen (via clickable group in Groups partition of PlansScreen)

### CreatePlanScreen

CreatePlanScreen contains:
    * option to make plan public (shows in search and map screens) or private
    * option to have a groupchat for the plan
    * Outing button occupying left side of the screen
    * Event button occupying right side of the screen

CreatePlanScreen -> CreateOutingScreen (via Outing button)
CreatePlanScreen -> CreateEventScreen (via Event button)

### CreateOutingScreen

CreateOutingScreen contains:
    * Title, description, location, Background, Icon fields
    * Maximum number of participants (15 people maximum)
    * Split the bill enabled
    * Paid/Free entry (If Paid Ticket Price)
    * Complementary amneties section (you get buy just joining outing)
    * populated with cards, with a mandatory button for payment incase the 
    plan allows payments
    * the CreateOutingScreen should have a rectangular card with a plus sign like a placeholder
    that when pressed will give a popup option for which card to populate the available cards should be: 
        + Service Cards
        + Item Cards
        + Insta-Pay Cards
    * Preorder has to be enabled to preorder(if its free still relevant for limited items) certain
    Items in the PlanScreen before event starts, otherwise its only going to be available during
    LivePlanScreen
    * CreateOutingScreen should contain a payment button if the event allows payment, which pays for all
    items ordered
    * Cards should be customizable with title, description and some specialized fields:
        + Service Cards need to be placed as a 1 Item and have queue time (or order of queue)
        + Item Cards should contain amount (can be unlimited if free)
        + Insta-Pay is for items that you can buy bypassing cart
    * Button to broadcast the Event
The Outing here is to differentiate from events which has people one doesn't know, from outings
which is for people that are friend groups etc...

CreateOutingScreen -> PlanScreen (after pressing done)

### CreateEventScreen

CreateEventScreen contains:
    * Title, description, location, Background, Icon fields
    * Maximum number of participants (Unlimited)
    * Paid/Free entry (If Paid Ticket Price)
    * Complementary amneties section (you get buy just joining outing)
    * populated with cards, with a mandatory button for payment incase the 
    plan allows payments
    * the CreateEventScreen should have a rectangular card with a plus sign like a placeholder
    that when pressed will give a popup option for which card to populate the available cards should be: 
        + Service Cards
        + Item Cards
        + Insta-Pay Cards
    * Preorder has to be enabled to preorder(if its free still relevant for limited items) certain
    Items in the PlanScreen before event starts, otherwise its only going to be available during
    LivePlanScreen
    * CreateEventScreen should contain a payment button if the event allows payment, which pays for all
    items ordered
    * Cards should be customizable with title, description and some specialized fields:
        + Service Cards need to be placed as a 1 Item and have queue time (or order of queue)
        + Item Cards should contain amount (can be unlimited if free)
        + Insta-Pay is for items that you can buy bypassing cart

CreateEventScreen -> PlanScreen (after pressing done)

### PlanScreen
The PlanScreen should be linked directly to the aforementioned, created Outing/Event (Plan), even
as placeholder should be linked to them, and contain:
    * A thematic difference between Outings and Events
    * Cards that were configured for the participants created in the CreateEventScreen and 
    CreateOutingScreen
    * A complement of what was filled out in the respective Create Screens for the participants to
    interact with based on that depending if pre
    * If event is not joined PlanScreen greys out anything relating to payment or ordering cards,
    and only allows to join event (add it to your PlansScreen) or just browse it 

PlanScreen -> PlansScreen/Any screen that showed the event example MapScreen (go back either via 
back button or when clicking participate in PlanScreen which also adds it to the PlansScreen Plan 
section and to the MapScreen)

### MapScreen
The MapScreen is a screen like a search but more interactive, it will have:
    * filters for My Plans vs All
    * a dial at the bottom (like a numberline that you can scroll left and right) that the user can
    interact with left and right, with the calendar being on that numbered line:
        + as the user scrolls through, the map should update with the map markers that pertain to 
        the plans that are available online (public) 
        + the dial needs to be efficient so as not to lag and default to current date
    * it needs to have on the top, a bar that shows a small rectangle with scrollable plans of this
    day (just for convenience)
    * Pressing on an plan being in the topbar or the map should show at the bottom as window with
    interested button (it opens the PlanScreen of that event/outing)
    * Use MapLibre for the mapscreen

MapScreen -> PlanScreen (via interested button)

### GroupScreen
A chat Room that gets added if configured in the CreatePlanScreen, as well as:
    * a whatsapp like chat screen where people can interact thats it, this is restricted to
    participants

GroupsScreen -> PlansScreen (via back button)

### LivePlanScreen
Same as PlanScreen (maybe can be refactored to use the same components/inheritance), but with 
non-greyed-out features for the current event that is happening and that the user has joined:
    * the LivePlanScreen activates 15 minutes before the plan starts, which ungreys (makes
    clickable) the nav button for the LivePlanScreen and adds a small blinking green dot to it 

## Overall Ideas
- No emojis
- 

## Notes for the overall placeholder setup:
- the placeholders should live inmemory and have 1 source of truth (centralized application state)
so that I am able to later on when I write the backend, change this one centralized state and for 
everything to fit like a glove when I have real data from the server
- have it be like some json file that loads on start or something
- setup up as placeholders around 100 plans (events/outings) with background 
images/icons/colors at your discretion
- setup around 10 events the user test account is registered in for testing
- make sure the data is not being duplicated or detached from the centralized state of the app
- all current non-working buttons should give some kind of alert with a message saying their purpose
for testing purposes

Mind you that UX is very crucial in this project
