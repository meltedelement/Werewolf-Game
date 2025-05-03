import javax.websocket.*;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;

@ServerEndpoint("/ws")
public class WebSocketServer {

    @OnOpen
    public void onOpen(Session session) {
        System.out.println("Connection opened: " + session.getId());
    }

    @OnMessage
    public void onMessage(String message, Session session) throws IOException {
        System.out.println("Received message: " + message);

        // Process the message (e.g., parse role and perform action)
        String response = processMessage(message);

        // Send response back to the client
        session.getBasicRemote().sendText(response);
    }

    @OnClose
    public void onClose(Session session) {
        System.out.println("Connection closed: " + session.getId());
    }

    private String processMessage(String message) {
        // Example: Parse the role and return a response
        Roles role = Roles.valueOf(message);
        new NightActions().performNightAction(role);
        return "Action performed for role: " + role;
    }
}