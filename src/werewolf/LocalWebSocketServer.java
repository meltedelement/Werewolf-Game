import org.java_websocket.server.WebSocketServer;
import org.java_websocket.WebSocket;
import org.java_websocket.handshake.ClientHandshake;

import java.net.InetSocketAddress;

public class LocalWebSocketServer extends WebSocketServer {

    public LocalWebSocketServer(int port) {
        super(new InetSocketAddress(port));
    }

    @Override
    public void onOpen(WebSocket conn, ClientHandshake handshake) {
        System.out.println("Connection opened: " + conn.getRemoteSocketAddress());
    }

    @Override
    public void onClose(WebSocket conn, int code, String reason, boolean remote) {
        System.out.println("Connection closed: " + conn.getRemoteSocketAddress());
    }

    @Override
    public void onMessage(WebSocket conn, String message) {
        System.out.println("Received message: " + message);

        // Process the message
        String response = processMessage(message);

        // Send response back to the client
        conn.send(response);
    }

    @Override
    public void onError(WebSocket conn, Exception ex) {
        ex.printStackTrace();
    }

    @Override
    public void onStart() {
        System.out.println("WebSocket server started on port " + getPort());
    }

    private String processMessage(String message) {
        // Example: Parse the role and return a response
        Roles role = Roles.valueOf(message);
        new NightActions().performNightAction(role);
        return "Action performed for role: " + role;
    }

    public static void main(String[] args) {
        int port = 8080; // Port to listen on
        LocalWebSocketServer server = new LocalWebSocketServer(port);
        server.start();
        System.out.println("Server started on port: " + port);
    }
}