export interface Campus {
  id: number;
  name: string;
  shortName?: string;
  street?: string;
  extNumber?: string;
  intNumber?: string;
  neighborhood?: string;
  zipCode?: string;
  city: string;
  state: string;
  country?: string;
  directorName?: string;
}
