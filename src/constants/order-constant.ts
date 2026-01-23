export const HEADER_TABLE_ORDER = [
  "No",
  "Order ID",
  "Customer Name",
  "Table",
  "Status",
  "Action",
];

export const INITIAL_ORDER = {
  customer_name: "",
  table_id: "",
  status: "",
};

export const INITIAL_STATE_ORDER = {
  status: "idle",
  errors: {
    customer_name: [],
    table_id: [],
    status: [],
    _form: [],
  },
};

export const STATUS_CREATE_ORDER = [
  { label: "Reserved", value: "reserved" },
  { label: "Process", value: "process" },
];

export const HEADER_TABLE_DETAIL_ORDER = [
  "No",
  "Menu",
  "Total",
  "Status",
  "Action",
];

export const FILTER_MENU = [
  { label: "All", value: "" },
  { label: "Mains", value: "mains" },
  { label: "Sides", value: "sides" },
  { label: "Beverages", value: "beverages" },
  { label: "Desserts", value: "desserts" },
];
