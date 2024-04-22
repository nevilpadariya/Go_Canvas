import * as React from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import { uploadIcon } from '../assets/images';

const Input = styled('input')({
  display: 'none',
});

export default function Upload() {
  return (
      <label htmlFor="contained-button-file" className="upload">
        <Input accept="image/*" id="contained-button-file" multiple type="file" />
        <Button variant="contained" component="span" className='upload-btn'>
          <img src={uploadIcon} alt="upload" />Choose Your File
        </Button>
        <p>No files selected</p>
      </label>
  );
}
