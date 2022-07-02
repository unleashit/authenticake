import * as yup from 'yup';

export interface LoginSchemaPasswordless {
  email: string;
}

export interface LoginSchema extends LoginSchemaPasswordless {
  password: string;
}

export const loginSchema: yup.SchemaOf<LoginSchema> = yup.object().shape({
  email: yup.string().required().max(255).email(),
  password: yup.string().required().max(255),
});

export const loginSchemaPasswordless: yup.SchemaOf<LoginSchemaPasswordless> =
  yup.object().shape({
    email: yup.string().required().max(255).email(),
  });
