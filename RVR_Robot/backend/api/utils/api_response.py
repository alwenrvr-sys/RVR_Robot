class ApiResponseStatus:
    SUCCESS = "Ok"
    ERROR = "Error"

class ErrorMessageType:
    INFO = "info"
    WARN = "warning"
    ERROR = "error"

def api_response(status, data=None, error=None):
    response = {
        "status": status
    }
    if data is not None:
        response["data"] = data
    if error is not None:
        response["error"] = error
    return response
