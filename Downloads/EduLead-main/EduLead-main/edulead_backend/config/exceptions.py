import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    OWASP A05 — Security Misconfiguration / Information Disclosure
    Ensures unhandled server errors return a generic message instead of
    leaking stack traces, internal paths, or database details.
    """
    response = exception_handler(exc, context)

    if response is None:
        view = context.get('view')
        logger.error(
            'Unhandled exception in %s: %s',
            getattr(view, '__class__', 'unknown'),
            exc,
            exc_info=True,
        )
        response = Response(
            {'detail': 'An unexpected error occurred. Please try again later.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return response
