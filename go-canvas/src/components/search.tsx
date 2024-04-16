import * as React from "react";
import { styled, alpha } from "@mui/material/styles";
import Toolbar from "@mui/material/Toolbar";
import InputBase from "@mui/material/InputBase";
import { searchIcon } from "../assets/images";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  display: "flex",
  alignItems: "center",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.1),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.2),
  },
  marginLeft: 0,
  width: "230px",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: "13px 14px 13px 0",

    transition: theme.transitions.create("width"),
    width: "100%",
  },
}));

export default function SearchBar() {
  return (
    <Toolbar>
      <Search>
        <img src={searchIcon} alt="search" />
        <StyledInputBase
          placeholder="Search."
          inputProps={{ "aria-label": "search" }}
        />
      </Search>
    </Toolbar>
  );
}
