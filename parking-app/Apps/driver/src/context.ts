import { createContext } from "react";
import { NewVehicle } from "@/vehicle";
import { NewPermit } from "@/permit"

interface AddVehicleContextType {
  setAddVehicle: (vehicle: NewVehicle) => void;
}

interface AddPermitContextType {
  setAddPermit: (permit: NewPermit) => void;
}

export const AddVehicleContext = createContext<AddVehicleContextType>({setAddVehicle: () => {}});
export const AddPermitContext = createContext<AddPermitContextType>({setAddPermit: () => {}})