/* Module content for the capability map.
   "inPortal" lists only items named in the B2BStays Hotel Portal module list supplied with the brief.
   Anything about measurement is a KPI the business can compute IF the listed data is recorded. */
window.B2B_MODULES = [
  {
    id: "bookings", icon: "bi-calendar-check", lines: ["Bookings & Agent", "Management"],
    title: "Bookings and Agent Management",
    manages: "Hotel bookings, agent bookings on file, commission payable, agent settings and agent channel mapping. The dashboard shows recent agent bookings and revenue by channel.",
    problem: "Enquiries, agent bookings and commissions sit in different places, so it is hard to see which channels convert and what each channel costs.",
    opportunity: "Revenue: clearer follow-up visibility may help convert more enquiries. Cost: seeing commission payable by channel supports acquisition-cost control.",
    kpis: ["Enquiry conversion rate", "Bookings & revenue by channel", "Commission as % of booking value", "Time to first response"],
    data: ["Enquiry date and source", "Booking status and outcome (confirmed / lost)", "Agent or channel ID", "Booking value and commission", "Response timestamps"],
    inPortal: ["Hotel Bookings", "Agent bookings on file", "Commission payable", "Agent Settings", "Agent Channel Mapping", "Revenue by channel (dashboard)"]
  },
  {
    id: "packages", icon: "bi-box-seam", lines: ["Packages & Custom", "Quotations"],
    title: "Packages and Custom Quotations",
    manages: "Manage Packages, Package Bookings, Package Commission, Destination Activities and Custom Package Quote. The dashboard shows quotation requests awaiting reply.",
    problem: "Custom quote requests are handled ad hoc, follow-up is inconsistent and nobody knows how many quotes ended as confirmed or lost.",
    opportunity: "Revenue: structured follow-up may convert more quotations. Margin: quoting from managed package data supports consistent pricing.",
    kpis: ["Quotation conversion rate", "Gross margin per package", "Quote response time", "Package commission as % of value"],
    data: ["Quotes issued, with date and status", "Outcome: confirmed or lost (and reason)", "Quoted price and supplier costs", "Package booking value"],
    inPortal: ["Manage Packages", "Package Bookings", "Package Commission", "Destination Activities", "Custom Package Quote", "Quotation requests awaiting reply (dashboard)"]
  },
  {
    id: "transport", icon: "bi-truck", lines: ["Transportation", "Management"],
    title: "Transportation Management",
    manages: "Availability Calendar, New Cab Booking, All Bookings, Vehicle Allocation, Vehicles, Manual Blocks, Operating Cities, Drivers, Suppliers, Locations, Rates, Masters, Reports, Company Profile and Settings.",
    problem: "Availability is checked manually, allocations can conflict and capacity can sit unused without anyone noticing.",
    opportunity: "Revenue: visibility of free capacity may reduce missed service opportunities. Cost: fewer allocation conflicts may reduce avoidable costs.",
    kpis: ["Vehicle utilization", "Contribution margin per trip", "Allocation conflicts", "Revenue per vehicle-day"],
    data: ["Vehicle available days vs booked days", "Trip price and rate applied", "Driver, vehicle and supplier cost per trip", "Manual blocks (maintenance etc.)"],
    inPortal: ["Availability Calendar", "New Cab Booking", "All Bookings", "Vehicle Allocation", "Vehicles", "Manual Blocks", "Operating Cities", "Masters", "Drivers", "Suppliers", "Locations", "Rates", "Reports", "Company Profile", "Settings"]
  },
  {
    id: "vendor", icon: "bi-people", lines: ["Vendor", "Management"],
    title: "Vendor Management",
    manages: "The Vendor Management module of the hotel portal. Transportation additionally holds Suppliers and Drivers masters.",
    problem: "Supplier coordination runs on calls and messages, so delays and cost variances are found late.",
    opportunity: "Cost: organized vendor records may help reduce delays and avoidable costs. Service: better visibility of supplier performance.",
    kpis: ["Supplier response time", "Cost per booking", "On-time fulfilment", "Agreed vs actual cost variance"],
    data: ["Supplier assignment per booking", "Request and confirmation timestamps", "Agreed vs actual cost", "Issues logged per supplier"],
    inPortal: ["Vendor Management", "Suppliers and Drivers (Transportation)"]
  },
  {
    id: "aftersales", icon: "bi-headset", lines: ["After-Sales", "Service"],
    title: "After-Sales Service",
    manages: "After Sales Service, Customer Management and Package Day Notifications, supported by the Notification Centre and templates.",
    problem: "Customer communication after booking is inconsistent, so issues surface late and repeat business is left to chance.",
    opportunity: "Revenue: more consistent service may support repeat bookings. Cost: structured follow-up may reduce rework.",
    kpis: ["Repeat booking rate", "Service request resolution time", "Share of bookings with notifications sent"],
    data: ["Customer ID linked to bookings", "Booking history over time", "Service requests with open/close timestamps"],
    inPortal: ["After Sales Service", "Customer Management", "Package Day Notifications"]
  },
  {
    id: "finance", icon: "bi-bank", lines: ["City Ledger &", "Financial Management"],
    title: "City Ledger and Financial Management",
    manages: "City Ledger, Accounts & Ledger, Manage Accounts, Analytics, and Charge Items & Banking. The dashboard shows payments received through payment links and group booking revenue with collection status.",
    problem: "Bookings, commissions and payments are tracked separately, reconciliation is delayed and overdue balances are hard to see.",
    opportunity: "Cash flow: timely collection follow-up may shorten collection time. Margin: reporting revenue, commission and cost together supports better decisions.",
    kpis: ["Days sales outstanding", "Overdue balance", "Collection rate", "Contribution margin", "Cost per booking"],
    data: ["Invoice and due dates", "Payments received and dates", "Commission payable / paid", "Direct costs per booking"],
    inPortal: ["City Ledger", "Accounts & Ledger", "Manage Accounts", "Analytics", "Charge Items & Banking", "Payments via payment links (dashboard)", "Group booking revenue and collection status (dashboard)"]
  },
  {
    id: "property", icon: "bi-building", lines: ["Property", "Management"],
    title: "Property Management",
    manages: "Add Property, Import Property (CSV) and Room Information.",
    problem: "Property and room records are inconsistent or duplicated, which weakens inventory data and downstream reporting.",
    opportunity: "Cost: fewer data errors may reduce rework. Revenue: reliable inventory data supports accurate availability and pricing.",
    kpis: ["Record accuracy", "Error rate on imports", "Room-data completeness", "Time to onboard a property"],
    data: ["Sample audit of property and room records", "Import error counts", "Onboarding start and finish dates"],
    inPortal: ["Add Property", "Import Property (CSV)", "Room Information"]
  },
  {
    id: "notify", icon: "bi-bell", lines: ["Notifications &", "Reporting"],
    title: "Notifications and Reporting",
    manages: "Notification Centre, Notification Templates, Notification History, Package Day Notifications, Document Library, Module Settings, Analytics and Transportation Reports.",
    problem: "Updates are sent manually and unevenly, and there is no single history of what was communicated or reported.",
    opportunity: "Cost: reusable templates may save staff time. Service: a notification history helps check that communication happened.",
    kpis: ["Share of bookings with a notification sent", "Follow-up time", "Report usage"],
    data: ["Notification history entries", "Booking list for coverage comparison", "Report run logs"],
    inPortal: ["Notification Centre", "Notification Templates", "Notification History", "Package Day Notifications", "Document Library", "Module Settings", "Analytics", "Transportation Reports"]
  }
];

window.B2B_FLOWS = [
  {
    id: "revenue", label: "Revenue growth",
    nodes: [
      ["Bookings and Enquiries", "Bookings, agent bookings and quotation requests are the raw demand. Recording each with a date, source and status is the starting point for everything downstream."],
      ["Better Tracking", "When every enquiry and booking has a status, nothing depends on memory. This is a process step the software supports; it does not happen by itself."],
      ["Faster Follow-up", "Dashboard views such as quotation requests awaiting reply make pending items visible, so a team can choose to respond sooner."],
      ["Improved Conversion Visibility", "With confirmed and lost outcomes recorded, conversion rate by channel or package can be calculated instead of guessed."],
      ["More Opportunities to Confirm Business", "Faster response and better visibility create more chances to confirm business. Whether that happens depends on how the team acts."],
      ["Measure Additional Revenue and Margin", "Compare conversion, booking value and margin before and after adopting a process. Attribute only what the data supports."]
    ]
  },
  {
    id: "cash", label: "Cash-flow control",
    nodes: [
      ["Bookings and Commission Records", "Bookings, commission payable and group booking revenue are recorded against accounts."],
      ["Payment and Ledger Visibility", "City Ledger, Accounts & Ledger and payments received via payment links bring the money side next to the booking side."],
      ["Structured Collection Follow-up", "Collection status per group booking and ledger balances show who still owes what, so follow-up can be organised."],
      ["Better Cash-Flow Management", "Knowing what is outstanding and what is due supports planning. Money collected for others is not the business's revenue."],
      ["Measure Outstanding Balances and Collection Time", "Track overdue balance and days sales outstanding over time to see whether collection is actually improving."]
    ]
  },
  {
    id: "ops", label: "Cost & utilization",
    nodes: [
      ["Package and Transport Management", "Packages, cab bookings, vehicles, drivers and suppliers are managed in connected modules."],
      ["Better Capacity and Supplier Coordination", "The Availability Calendar, Manual Blocks and Vehicle Allocation show what is free, blocked or assigned; Vendor Management organises supplier records."],
      ["Fewer Avoidable Operational Issues", "With availability and allocation in one place, some conflicts and last-minute scrambles may be avoided."],
      ["Better Utilization and Cost Control", "Used capacity versus available capacity, and cost per trip, become measurable."],
      ["Measure Contribution Margin", "Contribution margin = revenue minus variable costs. Track it per trip, package or vehicle to judge real impact."]
    ]
  }
];
