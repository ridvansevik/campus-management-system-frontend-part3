import { TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';

const FormInput = ({ formik, name, label, ...props }) => {
  const { t } = useTranslation();
  return (
    <TextField
      fullWidth
      margin="normal"
      id={name}
      name={name}
      label={label}
      value={formik.values[name]}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      error={formik.touched[name] && Boolean(formik.errors[name])}
      helperText={formik.touched[name] && formik.errors[name] ? t(formik.errors[name]) : undefined}
      {...props} // type="password" gibi ekstra propları geçirir
    />
  );
};

export default FormInput;