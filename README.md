# smartenit-sdk-angular2

## Installation

To install this library, run:

```bash
$ npm install smartenit-sdk-angular2 --save
```

## Using Smartenit Module

Include Smartenit Module on your Angular 2 main module:

```typescript
// ...
import { SmartenitModule } from 'smartenit-sdk-angular2/dist';

@NgModule({
  imports: [
    // ...
    SmartenitModule.withConfig({
        apiURL: 'https://api.smartenit.io/v2',
        clientId: '1zj3o5y....', // optional
        clientSecret: 'otTI9.....' // optional
    })
  ]
})
export class AppModule { }
```

Once your library is imported, you can use its components and services in your application.

## Services

### StorageService 
Service to store information locally, it supports a `ttl` (time to live) attribute to expire the content after given seconds.
If the data is expired will return: `null`

```typescript
import {StorageService} from 'smartenit-sdk-angular2/dist';

export class Page1 {
    constructor(public storage: StorageService) { }
    
    storeInfo(){
        this.storage.set({
            key: 'key', 
            value: {device: {state: 'on'}}, 
            ttl: 1
        });
        
        const storedValue = this.storage.get('key');
        
        console.log(storedValue);
        /*
         * Will print:
         * { device: { state : 'on' } }
         */
    }

}
```

### AuthService 
This service manages the current user session, and user login.

```typescript
import {AuthService} from 'smartenit-sdk-angular2/dist';

export class Page1 {
    constructor(public authService: AuthService) { }
    
    checkIfLoggedIn(){
        if(this.authService.isLoggedIn()){
            const accessToken = this.authService.getAccessToken();
            console.log('You are logged in with token: ' + accessToken);
        }else{
            console.log('You are not logged in');
        }
    }

}
```

### Oauth2Service 
This service interacts with OAuth2 Smartenit server


#### login
This method authenticates an user using `password` grant. In order to use this grant client id and secret muse be set
```typescript
import {Oauth2Service} from 'smartenit-sdk-angular2/dist';

export class Page1 {
    constructor(public oauthResource: Oauth2Service) { }
    
    login(){
        this.oauthResource.login('your@email.com', 'P@$$w0rd')
            .subscribe((response) => {
                console.log(response)
            }, (error) => {
                console.log(error)
            });
    }
}
```

#### logout
This method clears the curren user session
```typescript
import {Oauth2Service} from 'smartenit-sdk-angular2/dist';

export class Page1 {
    constructor(public oauthResource: Oauth2Service) { }
    
    logout(){
        this.oauthResource.logout();
    }
}
```

#### authenticateClient

The following example will authenticate the client (mobile app or web app) and it will create a new user

```typescript
// ...
this.oauthResource.authenticateClient('18386....', 'DTXsnv3I....')
    .subscribe((response) => {
        console.log(response);
        this.users.save({
            profile: {
                name: 'test',
                lastName: 'test'
            },
            username: 'test@gmail.com',
            password: 'someP@$$w0rd'
        }).subscribe(userResponse => {
            console.log(userResponse);
        }, userError => {
            console.log(userError);
        })
    }, (error) => {
        console.log(error);
    });
```

### MediaService 
This service manages file uploads to other API resources, for example a device or location image 

#### uploadBase64
This method uploads a base64 encoded JPEG image, when completed it returns the path of the image and the current version 
to handle cache. This method can be use to upload media for the following resources:
* devices
* areas
* scenes
* users
* locations

The following example uploads the main image of the location identified with `247d9e3b7c40af67db435000`

```typescript
import {MediaService} from 'smartenit-sdk-angular2/dist';

export class Page1 {
    constructor(public mediaService: MediaService) { }
    
    uploadImage(imageData){
        this.mediaService.uploadBase64(
            imageData, // data:image/png;base64,iVBORw0KGgo... 
            'filename.jpg', 
            'locations',
            '247d9e3b7c40af67db435000'
        ).subscribe((uploadResponse)=>{
            console.log(uploadResponse);
            /*
             * Will print:
             * {
             *      "message":"File uploaded",
             *      "data":{
             *          "url":"https://s3.amazonaws.com/smartenit-media-stg/547d9e3b7c40af67db439999/locations/247d9e3b7c40af67db435000/location-image.png",
             *          "version":2
             *      }
             * }
             */
        },(error) => {
            console.log(error);
        });
    }
}
```

### CRUDService
This is the base class for many Smartenit APIs it is composed of the following methods:

* save 
* list
* getById

#### save
Creates or updates a resource, the update operation is based on the `_id` object property.

```typescript
save(data: any, options?: IRequestOptions): Observable<any>
```

```typescript
// ...
this.users.save({
    profile: {
        name: 'test',
        lastName: 'test'
    },
    username: 'test@gmail.com',
    password: 'someP@$$w0rd'
}).subscribe(userResponse => {
    console.log(userResponse);
}, userError => {
    console.log(userError);
})
```

#### list
Reads a list of resources

```typescript
list(query?: any, options?: IRequestOptions): Observable<any>
```

The options interface has the following attributes:

```typescript
export interface IRequestOptions {
    limit?: number,
    page?: number,
    fields?: string[],
    sort?: string[],
    credentials?: boolean
}
```

`credentials` will be true by default for all requests, this passes the authentication information to the API call

Consider using fields projection to optimize your application speed ny requesting only the attributes you need.

```typescript
// ...
this.locations.list({}, {
    limit: 10,
    page:2,
    fields:['name','createdAt'],
    sort:['-createdAt', 'name']
}).subscribe((locationResponse) => {
    console.log(locationResponse);
}, error => {
    console.log(error);
})
```

#### getById
Reads a resource based on its `_id`
```typescript
this.users.getById('547d9e3b7c40af67db433ebb', {
    fields:['name','createdAt']
}).subscribe((userResponse) => {
    console.log(userResponse);
}, error => {
    console.log(error);
})
```

### UsersService
Interacts with users Smartenit API 

#### save

```typescript
import {UsersService} from 'smartenit-sdk-angular2/dist';

export class Page1 {
    constructor(public users: UsersService) { }
    
    singUp(){
        this.users.save({
            profile: {
                name: 'test',
                lastName: 'test'
            },
            username: 'test@gmail.com',
            password: 'someP@$$w0rd'
        }).subscribe(userResponse => {
            console.log(userResponse);
        }, userError => {
            console.log(userError);
        })
    }
}
```

#### recoverPassword
This method starts the process of password recovery, calls the API service to send a recovery email with instructions.
This method has to be used client authentication (not user authentication) as the password is not known by the user

```typescript
oauthResource.authenticateClient('1838SDE...', 'DTXsnv3I7....')
    .subscribe(() => {
        this.usersService.recoverPassword('lost@email.com')
            .subscribe((recoverResponse) => {
                console.log(recoverResponse);
            }, error => {
                console.log(error);
            });
    }, error => {
        console.log(error);
    });
```

### LocationsService
Interacts with Smartenit API locations 

```typescript
import {LocationsService} from 'smartenit-sdk-angular2/dist';

export class Page1 {
    constructor(public locations: LocationsService) { }
    
    listLocations(){
        this.locations.list({}, {
            limit: 10
        }).subscribe((locationResponse) => {
            console.log(locationResponse);
        },error => {
             console.log(error);
        });
    }
}
```

### CategoriesService
Interacts with Smartenit API device categories 

```typescript
import {CategoriesService} from 'smartenit-sdk-angular2/dist';

export class Page1 {
    constructor(public categories: CategoriesService) { }
    
    listCategories(){
        this.categories.list({}, {
            limit: 10,
            fields:['name']
        }).subscribe((categoriesResponse) => {
            console.log(categoriesResponse);
        },error => {
             console.log(error);
        });
    }
}
```

### DevicesService
Interacts with Smartenit API devices 


#### discover
Checks for devices in the same local network

```typescript
import {DevicesService} from 'smartenit-sdk-angular2/dist';

export class Page1 {
    constructor(public devices: DevicesService) { }
    
    discoverDevices(){
        const discoverOnlyNewDevices = true;
        
        this.devices.discover(discoverOnlyNewDevices).subscribe((discoveredDevices) => {
            console.log(discoveredDevices);
        },error => {
             console.log(error);
        });
    }
}
```

#### link
Links a discovered device to the logged account by providing the deviceId

```typescript
import {DevicesService} from 'smartenit-sdk-angular2/dist';

export class Page1 {
    constructor(public devices: DevicesService) { }
    
    linkTheDevice(deviceId:string){
        this.devices.link(deviceId).subscribe((discoveredDevices) => {
            console.log(discoveredDevices);
        },error => {
             console.log(error);
        });
    }
}
```

### EventsService
Interacts with Smartenit API events

```typescript
import {EventsService} from 'smartenit-sdk-angular2/dist';

export class Page1 {
    constructor(public events: EventsService) { }
    
    getInfoEvents(){
        this.events.list({type:'INFO'}, {
            limit: 10,
            fields:['title']
        }).subscribe((eventsResponse) => {
            console.log(eventsResponse);
        },error => {
            console.log(error);
        });
    }
}
```

### ScenesService
Interacts with Smartenit API scenes

```typescript
import {ScenesService} from 'smartenit-sdk-angular2/dist';

export class Page1 {
    constructor(public scenes: ScenesService) { }
    
    searchScenes(name){
        this.scenes.list({name:name}, {
            limit: 5,
            fields:['name']
        }).subscribe((scenesResponse) => {
            console.log(scenesResponse);
        },error => {
            console.log(error);
        });
    }
}
```

### WizardsService
Interacts with Smartenit API wizards

```typescript
import {WizardsService} from 'smartenit-sdk-angular2/dist';

export class Page1 {
    constructor(public wizards: WizardsService) { }
    
    listWizards(){
        this.wizards.list({}, {
            limit: 5
        }).subscribe((wizardsResponse) => {
            console.log(wizardsResponse);
        },error => {
            console.log(error);
        });
    }
}
```

### AreasService
Interacts with Smartenit API areas

```typescript
import {AreasService} from 'smartenit-sdk-angular2/dist';

export class Page1 {
    constructor(public areas: AreasService) { }
    
    listAreas(){
        this.areas.list({}, {
            limit: 5
        }).subscribe((areasResponse) => {
            console.log(areasResponse);
        },error => {
            console.log(error);
        });
    }
}
```

### ActionsService
Interacts with Smartenit API actions

```typescript
import {ActionsService} from 'smartenit-sdk-angular2/dist';

export class Page1 {
    constructor(public actions: ActionsService) { }
    
    listActions(){
        this.actions.list({}, {
            limit: 5
        }).subscribe((actionsResponse) => {
            console.log(actionsResponse);
        },error => {
            console.log(error);
        });
    }
}
```

### ConditionsService
Interacts with Smartenit API conditions

```typescript
import {ConditionsService} from 'smartenit-sdk-angular2/dist';

export class Page1 {
    constructor(public conditions: ConditionsService) { }
    
    listConditions(){
        this.conditions.list({}, {
            limit: 5
        }).subscribe((conditionsResponse) => {
            console.log(conditionsResponse);
        },error => {
            console.log(error);
        });
    }
}
```

### EffectsService
Interacts with Smartenit API effects

```typescript
import {EffectsService} from 'smartenit-sdk-angular2/dist';

export class Page1 {
    constructor(public effects: EffectsService) { }
    
    listEffects(){
        this.effects.list({}, {
            limit: 5
        }).subscribe((effectsResponse) => {
            console.log(effectsResponse);
        },error => {
            console.log(error);
        });
    }
}
```

## Models

Models are instances of the resources returned by the API, this instances have attached functionallities like 
plugins or event save and remove methods of their owner service.

#### addParent
```typescript
devicesService.list({name:'Messenger test'}).subscribe((deviceResult)=>{
    let device = deviceResult.data[0];

    areasService.list({}).subscribe((areasResponse)=>{
        // The first device is added as child of the first area
        device.addParent(areasResponse.data[0]).subscribe(parentResponse=>{
            console.log(parentResponse);
        });
    });
});
```
#### removeParent
```typescript
devicesService.list({name:'Messenger test'}).subscribe((deviceResult)=>{
    let device = deviceResult.data[0];

    areasService.list({}).subscribe((areasResponse)=>{
        // The first device is removed form the first area
        device.removeParent(areasResponse.data[0]).subscribe(parentResponse=>{
            console.log(parentResponse);
        });
    });
});
```

## Classes

### Device
Provides helper methods to interact with device instances, this object has all device properties from the Smartenit API 
along with the following methods:
* getPlugin: Returns the plugin for the given component and processor
```typescript
getPlugin(componentId:string, processorName:string):SmartenitPlugin {...}
```

The DevicesService uses this `Device` class to create device instances based on user requested information, e.g. when 
requesting a device list, the DevicesService will create a Device object for each one of the elements retrieved. All 
supported plugins will be loaded into the device so the user can control and receive telemetry from the device in real-time.
```typescript

import {Device} from 'smartenit-sdk-angular2/dist';

...

devicesService.list({'components.processors.name': 'OnOff'}, {limit: 5}).subscribe((devicesList) => {
    const firstDevice: Device = devicesList.data[0];
    
    console.log(firstDevice);
    // Will print a Device object rather that a regular Javascript Object
})
```

A Device has the following properties
* online: (Boolean) returns whether the device is online or offline
* type: returns the device type, e.g. ZigBee, WiFi, etc.
* model: returns the device model, e.g. ZMLC30, RainBee8, etc.
* plugins: returns an object containing the plugins loaded on the device
* processors: returns an list of the processors in all components of the device

A Device has the following methods
* executeMethod: Executes a command in a device
* getAttribute: Sends a read command for a device attribute
* setAttribute: Sends a set command for a device attribute
* getPlugin: returns a Plugin loaded on the device

### SmartenitPlugin
This class encapsulates device functionality, this abstract class is the base for all other plugins

## Smartenit Plugins

### OnOffPlugin
This class encapsulates a single Switch (On/Off) component in a device. It has the following methods
* on: Turns on the device component
* off: Turns off the device component
* toggle: Toggles the current device component state
* isOn: Returns `true` when a device component is on `false` otherwise
* isOff: Returns `true` when a device component is off `false` otherwise

```typescript
import {OnOffPlugin} from 'smartenit-sdk-angular2/dist';

...

devicesService.list({'components.processors.name': 'OnOff'}, {limit: 5}).subscribe((devicesList) => {
    const firstDevice: Device = devicesList.data[0];

    const switchOnePlugin = firstDevice.getPlugin('1', 'OnOff') as OnOffPlugin;

    switchOnePlugin.onData.subscribe((deviceData) => {
        console.log('Is On from plugin state', plugin.isOn());
        console.log('Is On from event', deviceData.state);
    });

    // Toggle device component 1 asynchronously
    switchOnePlugin.toggle();

    // Toggle device component 1 asynchronously and subscribe to response
    switchOnePlugin.toggle(true).subscribe((toggleResponse) => {
        console.log(toggleResponse);
    });
});
```

### SimpleMeteringServer
This class encapsulates a metering device component in a device. It has the following methods
* getFirstUnit: Returns the first unit of measurement e.g Kw
* getSecondUnit: Returns the first unit of measurement e.g Kwh
* getCurrentSummation: Returns the current summation of the device
* getInstantaneousDemand: Returns the instantaneous demand

```typescript
import {SimpleMeteringServerPlugin} from 'smartenit-sdk-angular2/dist';

...

devicesService.list({'components.processors.name': 'SimpleMeteringServer'}, {limit: 5}).subscribe((devicesList) => {
    const firstDevice: Device = devicesList.data[0];

    const meteringOnePlugin = firstDevice.getPlugin('1', 'SimpleMeteringServer') as SimpleMeteringServerPlugin;

    meteringOnePlugin.onData.subscribe((deviceData) => {
        console.log('Current Summation', meteringOnePlugin.getCurrentSummation());
        console.log('Instantaneous Demand', meteringOnePlugin.getInstantaneousDemand());
        console.log('First Unit', meteringOnePlugin.getFirstUnit());
    });

    firstDevice.getStatus('1', 'SimpleMeteringServer');
});
```

### LevelControlServerPlugin
This class encapsulates a component that has a level control (Dimmer). It has the following methods
* getLevel: Returns the current level of the device component
* setLevel: Sets the current level of the device component

```typescript
import {LevelControlServerPlugin} from 'smartenit-sdk-angular2/dist';

...

devicesService.list({'components.processors.name': 'LevelControlServer'}, {limit: 5}).subscribe((devicesList) => {
    const firstDevice: Device = devicesList.data[0];

    const levelOnePlugin = firstDevice.getPlugin('1', 'LevelControlServer') as LevelControlServerPlugin;

    levelOnePlugin.onData.subscribe((deviceData) => {
        console.log('Level', levelOnePlugin.getLevel());
    });

    levelOnePlugin.setLevel(50);
});
```

### DiscoverPlugin
This class encapsulates a component that can discover other devices on the same network, for example a gateway/hub that
can discover Zigbee devices. The discovery process progress is persisted on the local cache.

```typescript
import {DiscoverPlugin} from 'smartenit-sdk-angular2/dist';

...

devicesService.list({'components.processors.name': 'Discover'}, {limit: 5}).subscribe((devicesList) => {
  const firstDevice: Device = devicesList.data[0];
  
  if (firstDevice) {
    let plugin = firstDevice.getPlugin('1', 'Discover') as DiscoverPlugin;

    plugin.onUpdate.subscribe((progress) => {
      console.log('Discover Progress', progress);
    });

    plugin.startDiscovery();

    // plugin.stopDiscovery();
  }
});
```

### BasicServerPlugin
This class provides an interface to basic device information

```typescript
import {DiscoverPlugin} from 'smartenit-sdk-angular2/dist';

...

devicesService.list({'components.processors.name': 'BasicServer'}, {limit: 5}).subscribe((devicesList) => {
    const firstDevice: Device = devicesList.data[0];

    if (firstDevice) {
      let plugin = firstDevice.getPlugin('1', 'BasicServer') as BasicServerPlugin;

      plugin.onData.subscribe((data) => {
        console.log('hardwareVersion', plugin.hardwareVersion);
        console.log('softwareVersion', plugin.softwareVersion);
      });

      plugin.getHardwareVersion();
      plugin.getSoftwareVersion();
    }
  });
```

## License

MIT © [Smartenit](mailto:gabo.b@smartenit.com)
