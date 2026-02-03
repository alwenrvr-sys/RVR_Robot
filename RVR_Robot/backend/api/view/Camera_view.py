from rest_framework.decorators import api_view
from rest_framework.response import Response
from ..service.camera import get_camera, close_camera
from ..utils.api_response import (
    api_response,
    ApiResponseStatus,
    ErrorMessageType,
)


@api_view(["POST"])
def trigger_camera(request):
    try:
        current_z = request.data.get("current_z")

        if current_z is None:
            return Response(
                api_response(
                    status=ApiResponseStatus.ERROR,
                    error={
                        "type": ErrorMessageType.ERROR,
                        "message": "current_z is required",
                    },
                ),
                status=400,
            )

        camera = get_camera()
        camera.trigger_with_autosetup(float(current_z))

        return Response(
            api_response(
                status=ApiResponseStatus.SUCCESS,
                data={
                    "message": "Camera triggered successfully",
                    "current_z": float(current_z),
                },
            ),
            status=200,
        )

    except Exception as e:
        return Response(
            api_response(
                status=ApiResponseStatus.ERROR,
                error={
                    "type": ErrorMessageType.ERROR,
                    "message": str(e),
                },
            ),
            status=500,
        )


@api_view(["POST"])
def disconnect_camera(request):
    close_camera()
    return Response(
        api_response(
            status=ApiResponseStatus.SUCCESS,
            data={"message": "Camera disconnected"},
        ),
        status=200,
    )
