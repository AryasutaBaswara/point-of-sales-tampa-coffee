export const HEADER_TABLE_TABLE = [
  "No",
  "Name",
  "Capacity",
  "Status",
  "Action",
];

export const STATUS_TABLE_LIST = [
  { label: "Available", value: "available" },
  { label: "Unavailable", value: "unavailable" },
  { label: "Reserved", value: "reserved" },
];

export const INITIAL_TABLE = {
  name: "",
  description: "",
  capacity: "",
  status: "",
};

export const INITIAL_STATE_TABLE = {
  status: "idle",
  errors: {
    id: [],
    name: [],
    description: [],
    capacity: [],
    status: [],
    _form: [],
  },
};
