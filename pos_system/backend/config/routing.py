from django.urls import path
from apps.dashboard.consumers import StockConsumer, OrderConsumer

websocket_urlpatterns = [
    path('ws/stock/', StockConsumer.as_asgi()),
    path('ws/order/', OrderConsumer.as_asgi()),
]
