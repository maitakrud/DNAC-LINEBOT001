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

def getDevices(accessToken, ipAddress):
    """

    Get All Device list

    """

    url = "https://10.20.99.22/api/v1/network-device/serial-number/{}".format(ipAddress)
    headers["x-auth-token"] = accessToken
    getDevices_response = requests.get(url, headers=headers, verify=False)
    getDevices_response = getDevices_response.json()["response"]

    return getDevices_response

def toString(devicesDetail):

    if (devicesDetail["errorCode"] == "Bad request"):

        textData = devicesDetail["detail"]

    elif (devicesDetail["errorCode"] == "Not found"):

            textData = devicesDetail["detail"]

    else:

        textData = "Device detail following.\n"
        textData += "MGMT IP Address      :   {}\n".format(devicesDetail['managementIpAddress'])
        textData += "MAC Address             :   {}\n".format(devicesDetail['macAddress'])
        textData += "Hostname                 :   {}\n".format(devicesDetail['hostname'])
        textData += "Serial Number           :   {}\n".format(devicesDetail['serialNumber'])
        textData += "Type                         :   {}\n".format(devicesDetail['type'])
        textData += "Platform                    :   {}\n".format(devicesDetail['platformId'])
        textData += "Software Version        :   {}\n".format(devicesDetail['softwareVersion'])
        textData += "Software Type            :   {}\n".format(devicesDetail['softwareType'])
        textData += "Collection Status         :   {}\n".format(devicesDetail['collectionStatus'])
        textData += "Reacgability Status      :   {}\n".format(devicesDetail['reachabilityStatus'])
        textData += "Uptime                      :   {}\n".format(devicesDetail['upTime'])
        textData += "Role                          :   {}\n".format(devicesDetail['role'])

    return textData

if __name__ == '__main__':

    with open('credential.json') as credential_file:
        dnac = json.load(credential_file)
    dnac_ipAddress = dnac["EV DNA Center"][0]["ip"]
    dnac_username = dnac["EV DNA Center"][0]["username"]
    dnac_password = dnac["EV DNA Center"][0]["password"]
    ipAddress = str(sys.argv[1])
    token = getToken(dnac_ipAddress, dnac_username, dnac_password)
    getDevicesDetail = getDevices(token, ipAddress)
    message = toString(getDevicesDetail)
    print(message)
