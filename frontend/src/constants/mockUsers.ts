export interface MockUserProfile {
  id: string;
  sub: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export const MOCK_USER_PROFILES: MockUserProfile[] = [
  {
    id: 'approver_joanna',
    sub: 'approver-user-joanna',
    email: 'joanna.c.ramsey.civ@mail.mil',
    username: 'joanna.c.ramsey',
    firstName: 'Joanna',
    lastName: 'Ramsey',
    roles: ['marketplace-approver'],
  },
  {
    id: 'approver_jennifer',
    sub: 'approver-user-jennifer',
    email: 'jennifer.a.cowley.civ@mail.mil',
    username: 'jennifer.a.cowley',
    firstName: 'Jennifer',
    lastName: 'Cowley',
    roles: ['marketplace-approver'],
  },
  {
    id: 'approver_jane',
    sub: 'approver-user-jane',
    email: 'jane.f.roberts.civ@mail.mil',
    username: 'jane.f.roberts',
    firstName: 'Jane',
    lastName: 'Roberts',
    roles: ['marketplace-approver'],
  },
  {
    id: 'requestor_vinoth',
    sub: 'requestor-user-vinoth',
    email: 'vinoth.jagannathan.civ@mail.mil',
    username: 'vinoth.jagannathan',
    firstName: 'Vinoth',
    lastName: 'Jagannathan',
    roles: ['marketplace-requestor'],
  },
  {
    id: 'requestor_elizabeth',
    sub: 'requestor-user-elizabeth',
    email: 'elizabeth.y.ahn.civ@mail.mil',
    username: 'elizabeth.y.ahn',
    firstName: 'Elizabeth',
    lastName: 'Ahn',
    roles: ['marketplace-requestor'],
  },
  {
    id: 'requestor_daniel',
    sub: 'requestor-user-daniel',
    email: 'daniel.e.allen.civ@mail.mil',
    username: 'daniel.e.allen',
    firstName: 'Daniel',
    lastName: 'Allen',
    roles: ['marketplace-requestor'],
  },
];
