import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button, Autocomplete } from "@mui/material"
import { useContext } from "react"
import { useTranslations } from "next-intl"
import { AddVehicleContext } from "../../context"

interface AddVehicleDialogProps {
  open: boolean;
  handleClose: () => void;
  handleSubmit: () => void
}

const states = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
  'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
  'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
  'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
  'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
  'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
  'West Virginia', 'Wisconsin', 'Wyoming'
];

export function AddVehicleDialog({ open, handleClose, handleSubmit }: AddVehicleDialogProps) {
  const { setAddVehicle } = useContext(AddVehicleContext)
  const t = useTranslations('vehicle')

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries(formData.entries());
    setAddVehicle({
      plate: formJson.plate as string,
      state: formJson.state as string
    });
    handleSubmit();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <form onSubmit={onSubmit}>
        <DialogTitle>{t('add')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            required
            margin="dense"
            name="plate"
            label={t('license')}
            type="text"
            fullWidth
            variant="standard"
          />
          {/* <TextField
            required
            margin="dense"
            name="state"
            label={t('state')}
            type="text"
            fullWidth
            variant="standard"
          /> */}
          <Autocomplete
            sx={{mt: 3}}
            options={states}
            renderInput={
              (params) => (
                <TextField {...params}
                  required 
                  name="state" 
                  label={t('state')}
                  variant="standard"
                />
              )
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t('cancel')}</Button>
          <Button type="submit">{t('submit')}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default AddVehicleDialog;
