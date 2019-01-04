import sys
sys.path.append('/Users/Chanokchon/Documents/Work/Programming/Code/DNAC_LINEBOT001/venv/lib/python3.7/site-packages')
import argparse
import requests
import base64
import json
import urllib3
import urllib.request
import getpass
from http import HTTPStatus
from requests.auth import HTTPBasicAuth
from time import sleep


urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

headers = {
              'content-type': "application/json",
              'x-auth-token': ""
          }

def getToken(dnacAddress, username, password):
    """
    Get Token by use username and password , Token will use to authenticate
    every time when call any APIs.
    """

    tokenUrl = "https://{}/api/system/v1/auth/token".format(dnacAddress)

    token_responese = requests.post(tokenUrl, auth=HTTPBasicAuth(username, password),
                                headers=headers, verify=False)

    return token_responese.json()['Token']

def getDevices(accessToken):
    """

    Get All Device list

    """

    url = "https://10.20.99.22/api/v1/network-device/"
    headers["x-auth-token"] = accessToken
    getDevices_response = requests.get(url, headers=headers, verify=False)
    getDevices_response = getDevices_response.json()["response"]

    return getDevices_response

def toString(devicesDetail):

    textData = "All Devices list following.\n"
    deviceNumber = len(devicesDetail)

    for x in range(deviceNumber):

        textData += "Device Number {}\n".format(x+1)
        textData += "MGMT IP Address   :   {}\n".format(getDevicesDetail[x]['managementIpAddress'])
        textData += "Hostname              :   {}\n".format(getDevicesDetail[x]['hostname'])

        if x == deviceNumber:
            break

    return textData

if __name__ == '__main__':

    with open('credential.json') as credential_file:
        dnac = json.load(credential_file)
    dnac_ipAddress = dnac["EV DNA Center"][0]["ip"]
    dnac_username = dnac["EV DNA Center"][0]["username"]
    dnac_password = dnac["EV DNA Center"][0]["password"]
    token = getToken(dnac_ipAddress, dnac_username, dnac_password)
    getDevicesDetail = getDevices(token)
    message = toString(getDevicesDetail)
    print(message)
