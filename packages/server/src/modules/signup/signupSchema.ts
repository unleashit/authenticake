import * as yup from 'yup';

export interface SignupSchema {
  email: string;
  password: string;
  passwordConfirm: string;
}

export const signupSchema: yup.SchemaOf<SignupSchema> = yup.object().shape({
  email: yup.string().required().trim().max(255).email(),
  password: yup
    .string()
    .required()
    .min(8)
    .max(255)
    .matches(
      /^[0-9a-zA-Z]|[!@#$%^&*]*$/,
      'Password must be alpha numeric or the characters !@#$%^&*',
    ),
  passwordConfirm: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Password confirm is required'),
});
