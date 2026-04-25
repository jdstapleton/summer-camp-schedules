export interface ImportColumnConfig {
  lastName: string[];
  firstName: string[];
  gender: string[];
  age: string[];
  sessionName: string[];
  selections: string[];
  specialRequest: string[];
  medicalIssues: string[];
  photo: string[];
  tshirtSize: string[];
  primaryName: string[];
  primaryHomePhone: string[];
  primaryCellPhone: string[];
  secondaryName: string[];
  secondaryCellPhone: string[];
  emergencyName: string[];
  emergencyPhone: string[];
  custody: string[];
}

export const DEFAULT_IMPORT_COLUMNS: ImportColumnConfig = {
  lastName: ['Participant: Last name'],
  firstName: ['Participant: First name'],
  gender: ['Participant: Gender'],
  age: ['Participant: Age as of session'],
  sessionName: ['Session name'],
  selections: ['Selections'],
  specialRequest: ['Participant: Do you have any special requests?'],
  medicalIssues: ['Participant: Does your child have any medical issues?'],
  photo: ["Participant: Do we have permission to take your child's picture?"],
  tshirtSize: ['Participant: Camper T-shirt Size', 'Participant: Camper T-shirt Size:'],
  primaryName: ['Primary P/G: Name', 'Primary P/G: First name', 'Primary Parent/Guardian Name'],
  primaryHomePhone: ['Primary P/G: Home phone number', 'Primary Parent/Guardian Home Phone'],
  primaryCellPhone: ['Primary P/G: Cell phone number', 'Primary Parent/Guardian Cell Phone'],
  secondaryName: ['Secondary P/G: Name', 'Secondary P/G: First name', 'Secondary Parent/Guardian Name'],
  secondaryCellPhone: ['Secondary P/G: Cell phone number', 'Secondary Parent/Guardian Cell Phone'],
  emergencyName: ['Participant: Emergency contact name'],
  emergencyPhone: ['Participant: Emergency contact phone number.', 'Participant: Emergency contact phone number'],
  custody: ['Participant: Who has custody of your child?'],
};
