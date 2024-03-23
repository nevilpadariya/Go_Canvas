import React from "react";
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { selectDropdown } from "../assets/images";

function DropdownArrow() {
    return (
        <img className="dropdown-icon" src={selectDropdown} alt="downarrow" />
    );
}

function DropdownField(){
    const [number, setNumber] = React.useState('');
    const handleChange = (event: SelectChangeEvent) => {
        setNumber(event.target.value as string);
    };
    return(
        <>
        <FormControl variant="standard" className="dropdown">
    <InputLabel id="demo-simple-select-standard-label">Dropdown</InputLabel>
    <Select
        name="dropdown"
        value={number}
        onChange={handleChange}
        displayEmpty
        IconComponent={DropdownArrow}
        inputProps={{ "aria-label": "Without label" }}
        sx={{ width: "100%" }}
    >

        <MenuItem value={"10"}>One</MenuItem>
        <MenuItem value={"20"}>Two</MenuItem>
        <MenuItem value={"30"}>Three</MenuItem>
    </Select>
</FormControl>
        </>
    );
}
export default DropdownField;
