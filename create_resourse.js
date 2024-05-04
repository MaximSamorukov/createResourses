import { faker } from '@faker-js/faker';
import axios from 'axios';

const LOGIN_URL = 'http://localhost:5000/api/users/login';
const GET_CASE_TYPES_URL = 'http://localhost:5030/api/casetypes';
const CASE_TYPE_NAME = 'CaseTemplate.112.Card.Title';
const CREATE_STATION_URL = 'http://localhost:5018/api/stations';
const GET_STATIONS_URL = 'http://localhost:5018/api/stations';
const CREATE_RESOURSE_URL = 'http://localhost:5018/api/resources';
const ADD_LOCATION_TO_RESOURCE = 'http://localhost:5018/api/resources/location';
const owner = faker.person.fullName();

const [_node, _file, login, password, latitude, longitude, speed, course] = process.argv;

axios.post(LOGIN_URL, {
   login,
   password,
   userMetaData: {
      computerName: 'computer name'
   }
}).then((data) => {
   const { accessToken, tokenType } = data.data;
   axios.get(GET_CASE_TYPES_URL, {
      headers: {
         Authorization: `${tokenType} ${accessToken}`
      }
   }).then(({ data }) => {
      const { id: caseTypeId } = data.find((i) => i.name === CASE_TYPE_NAME);
      axios.post(CREATE_STATION_URL, {
         code: "string",
         name: "string",
         caseTypeId,
         description: "string",
         stationState: true,
         externalId: "string",
         additionalInfo: "string",
         owner
      }, {
            headers: {
               Authorization: `${tokenType} ${accessToken}`,
            },
      }).then(({ data }) => {
         throw new Error();
      }).catch(() => {
         axios.get(GET_STATIONS_URL, {
            headers: {
               Authorization: `${tokenType} ${accessToken}`,
            },
         }).then(( { data }) => {
            const { stations } = data;
            const station = stations.find((i) => i.owner === owner);
            const stationId = station.id;
            axios.post(CREATE_RESOURSE_URL, {
               "name": faker.person.firstName(),
               caseTypeId,
               "description": "string",
               "isActive": true,
               "externalId": "string",
               "payload": "string",
               owner,
               stationId,
               "caseTypeName": "string",
               "equipment": "string",
               "crew": "string",
               "competencies": "string"
            },
            {
               headers: {
                  Authorization: `${tokenType} ${accessToken}`,
               },
            }
         ).then(({ data: { id: resourceId} }) => {
            axios.post(ADD_LOCATION_TO_RESOURCE, {
               resourceId,
               location: {
                 longitude,
                 latitude
               },
               course: course || 0,
               speed: speed || 0,
            }, {
                  headers: {
                     Authorization: `${tokenType} ${accessToken}`,
                  },
               }
            ).then(({ data }) => {
               console.log(data)
            }).catch((e) => {
               console.log('Error moving resource', e);
            })
         }).catch((e) => {
            console.log('Error creating resource: ', e);
         })
         })
      })
   }).catch(() => {})
})