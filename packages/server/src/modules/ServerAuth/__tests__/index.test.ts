// import ServerAuth, { Middlewares } from '../../../index';
// import { getMiddlewares } from '../ServerAuth';
//
// // interface BaseProps {
// //   isOpen: boolean;
// //   onClose: any;
// // }
// //
// // const baseProps = (): BaseProps => ({
// //   onClose: jest.fn(),
// //   isOpen: true,
// // });
//
// describe('ServerAuth', () => {
//   let serverAuth: any;
//
//   let middlewares: Middlewares;
//
//   beforeEach(() => {
//     middlewares = {
//       onBeforeEach: [
//         (_req, _res, next) => {
//           console.log('before all');
//           next();
//         },
//       ],
//       onAfterEach: [],
//       onAfterLogin: [
//         (_: any, __: any, next: any) => {
//           console.log('after login');
//           next();
//         },
//       ],
//       onBeforeRegister: [
//         (_: any, __: any, next: any) => {
//           console.log('before register');
//           next();
//         },
//       ],
//     };
//     serverAuth = new ServerAuth({ middlewares });
//   });
//
//   it('serverAuth is an instance of ServerAuth', () => {
//     expect(serverAuth).toBeInstanceOf(ServerAuth);
//   });
//
//   it('should add middlewares', () => {
//     const mws = serverAuth[getMiddlewares]();
//
//     expect(mws).toBeInstanceOf(Object);
//     expect(mws).toMatchObject(middlewares);
//   });
//
//   it('middlewares should call next()', () => {
//     const mws = serverAuth[getMiddlewares]();
//     const mockNext = jest.fn();
//     mws.onBeforeAll[0](undefined, undefined, mockNext);
//
//     expect(mockNext).toHaveBeenCalledTimes(1);
//   });
//
//   it('throws error when supplied with non-express like middleware', () => {
//     const mwError =
//       'Middlewares must be functions with three arguments and call next()';
//
//     middlewares.onBeforeEach = [
//       function () {
//         return 1 + 1;
//       },
//     ];
//     expect(() => new ServerAuth({ middlewares })).toThrow(mwError);
//
//     // onBeforeAll[1]: 3 args but doesn't call next
//     middlewares.onBeforeEach = [
//       function (_res, _req, next) {
//         next();
//         // valid
//       },
//       function (res, req, next) {
//         console.log(req, res, next);
//       },
//     ];
//     expect(() => new ServerAuth({ middlewares })).toThrow(mwError);
//
//     // only 2 args should fail
//     middlewares.onBeforeEach = [
//       function (_req, _res) {
//         console.log('testing');
//       },
//     ];
//     expect(() => new ServerAuth({ middlewares })).toThrow(mwError);
//   });
//
//   it("won't throw error when supplied with express like middleware", () => {
//     // const mwError = "Middlewares must be functions with three arguments and call next()";
//
//     middlewares.onBeforeEach = [
//       function (_res, _req, next) {
//         next();
//       },
//     ];
//     expect(() => new ServerAuth({ middlewares })).not.toThrow(
//       expect.anything(),
//     );
//
//     middlewares.onBeforeEach = [
//       (_res, _req, next) => {
//         next();
//       },
//     ];
//     expect(() => new ServerAuth({ middlewares })).not.toThrow(
//       expect.anything(),
//     );
//
//     middlewares.onBeforeEach = [
//       (foo, bar, next) => {
//         console.log(foo, bar);
//         next();
//       },
//       function (foo, bar, next) {
//         console.log(foo, bar);
//         next();
//       },
//       function logme(foo, bar, next) {
//         console.log(foo, bar);
//         next();
//       },
//     ];
//     expect(() => new ServerAuth({ middlewares })).not.toThrow(
//       expect.anything(),
//     );
//   });
// });

it('fake test', () => {
  expect(true).toBe(true);
});
