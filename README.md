# Triton API

This is the backend for the Triton Station's intra system.

## Requirements

Depending on your existing setup you need to install at least docker. 

### Just running the server and database

The only thing you need is Docker. Get it [here](https://www.docker.com/community-edition)

If you are running Windows, you might need to do some additional setup to get Docker working. Refer to [guide](https://docs.docker.com/docker-for-windows/) and [this](https://docs.docker.com/toolbox/toolbox_install_windows/#step-1-check-your-version) guide. At least run the quickstart to get started.

You will also need to modify the settings for the VirtualBox machine Docker is using.

    Go to VirtualBox -> Your BOX -> Settings -> Network ->
    Choose NAT
    Open Advanced
    Click Port Forwarding
    Add new rule to map whatever port you need from host to guest(for example 3000 to 3000)
    Click OK, OK
    Then stop, start the BOX

### Development

You will need NodeJS and npm and all that jazz. An editor might we helpful as well.

## Running the server

* Rename the env-example-file at the repository root to .env. Modify the variables if you deem necessary.

* Rename the env-example-file at app folder to .env. Change the session secret and database name for the very least.

Then you just need to invoke the following command at the repository root

    docker-compose up --build -d

This will build/pull the needed the docker images and start the respective container in the background. You can drop the --build option if you want to use the existing images.

The server will now reply on localhost, from the port you specified in the .env file at repository root.

## Generating the documentation

We use apiDoc for documentation generation. You need to first install apiDock

    npm install -g apidoc

Then you can generate the documentation by:

    cp app
    apidoc -i src -o apidoc

You can now view the API documentation with your browser.