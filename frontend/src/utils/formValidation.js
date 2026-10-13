export const buatPesanValidasi = ({
  wajib,
  email,
  terlaluPendek
}) => (event) => {
  const { validity } = event.currentTarget;

  if (validity.valueMissing) {
    event.currentTarget.setCustomValidity(wajib);
  } else if (validity.typeMismatch) {
    event.currentTarget.setCustomValidity(email || 'Masukkan data yang valid');
  } else if (validity.tooShort) {
    event.currentTarget.setCustomValidity(terlaluPendek || wajib);
  } else {
    event.currentTarget.setCustomValidity('');
  }
};

export const hapusPesanValidasi = (event) => {
  event.currentTarget.setCustomValidity('');
};
