import json
from channels.generic.websocket import AsyncWebsocketConsumer


class StockConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add('stock_updates', self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard('stock_updates', self.channel_name)

    async def stock_update(self, event):
        await self.send(text_data=json.dumps(event['data'], default=str))


class OrderConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add('order_updates', self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard('order_updates', self.channel_name)

    async def order_update(self, event):
        await self.send(text_data=json.dumps(event['data'], default=str))
