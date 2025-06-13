import { Dialog, DialogTitle, DialogActions, Button, TextField, MenuItem, Typography, Box } from "@mui/material";
import { PermitType, PermitZone } from '../../permit/index'
import { Vehicle } from "@/vehicle";
import { useState, useContext, useEffect } from "react";
import { getPermitCountInZone } from "./actions";
import { AddPermitContext } from "../../context"
import { useTranslations } from "next-intl";

interface BuyPermitDialogProps {
  open: boolean
  permitTypes: PermitType[]
  permitZones: PermitZone[]
  vehicles: Vehicle[]
  handleClose: () => void
  handleSubmit: () => void
}

export function BuyPermit({ open, permitTypes, permitZones, vehicles = [], handleClose, handleSubmit }: BuyPermitDialogProps) {
  const [selectedType, setSelectedType] = useState<PermitType>()
  const [selectedZone, setSelectedZone] = useState<PermitZone>()
  const [selectedVehicle, setSelectedVehicle] = useState("")
  const { setAddPermit } = useContext(AddPermitContext)
  const [permitWarning, setPermitWarning] = useState("");
  const handleTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = permitTypes.find(pt => pt.id === event.target.value);
    setSelectedType(selected);
  };
  const handleZoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = permitZones.find(pz => pz.id === event.target.value);
    setSelectedZone(selected);
  };
  const handleVehicleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedVehicle(event.target.value);
  };
  const t = useTranslations("permit")

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries((formData).entries());
    setAddPermit({
      typeId: formJson.permitType as string,
      zoneTypeId: formJson.permitZone as string,
      vehicleId: formJson.vehicle as string
    });
    handleSubmit();
  };

  useEffect(() => {
    const checkPermitAvailability = async () => {
      if (!selectedZone) return;
      try {
        const usedCount = await getPermitCountInZone(selectedZone.zone);
        if (typeof usedCount !== 'number') {
          setPermitWarning("Could not verify permit availability.");
        } else if (usedCount >= selectedZone.maxPermits) {
          const message = `No more permits available in zone ${selectedZone.zone}`;
          setPermitWarning(message);
        } else {
          setPermitWarning("");
        }
      } catch (err) {
        console.error("Permit check failed:", err);
        setPermitWarning("");
      }
    };
    checkPermitAvailability();
  }, [selectedZone]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <form onSubmit={onSubmit}>
        <DialogTitle>{t('buy')}</DialogTitle>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <TextField
            select
            required
            margin="dense"
            id="permitType"
            name="permitType"
            label={t("permittype")}
            value={selectedType ? selectedType.id : ""}
            onChange={handleTypeChange}
            defaultValue=""
            sx={{ maxWidth: 300, width: '100%' }}
          >
            {permitTypes.map((permitType, index) => (
              <MenuItem key={index} value={permitType.id} aria-label={permitType.type}>
                {permitType.type}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            required
            margin="dense"
            id="permitZone"
            name="permitZone"
            label={t("permitzone")}
            value={selectedZone ? selectedZone.id : ""}
            onChange={handleZoneChange}
            defaultValue=""
            sx={{ maxWidth: 300, width: '100%' }}
          >
            {permitZones.map((permitZone, index) => (
              <MenuItem key={index} value={permitZone.id} aria-label={permitZone.zone}>
                {permitZone.zone}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            required
            margin="dense"
            id="vehicle"
            name="vehicle"
            label={t("vehicle")}
            value={selectedVehicle}
            onChange={handleVehicleChange}
            defaultValue=""
            sx={{ maxWidth: 300, width: '100%' }}
          >
            {vehicles.map((vehicle, index) => (
              <MenuItem key={index} value={vehicle.id}>
                {vehicle.plate}
              </MenuItem>
            ))}
          </TextField>
        </Box>
        {permitWarning && (
          <Typography
            color="error"
            align="center"
            sx={{
              mt: 2,
              fontWeight: 'bold',
              fontSize: '1rem',
              maxWidth: '80%',
              mx: 'auto',
            }}
          >
            {permitWarning}
          </Typography>
        )}
        <DialogActions>
          {selectedType && (
            <Typography sx={{ mt: 1, mb: 1 }}>
              Price: ${selectedType.price}
            </Typography>
          )}
          <Button onClick={handleClose}>{t("cancel")}</Button>
          <Button type="submit" disabled={!!permitWarning}>{t("buy")}</Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default BuyPermit