import java.awt.event.MouseListener;
import java.awt.event.MouseMotionListener;
import java.awt.MouseInfo;
import java.awt.Point;
import java.awt.Robot;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.awt.event.MouseEvent;
import java.awt.event.ActionListener;
import java.awt.event.ActionEvent;
import java.awt.event.KeyListener;
import java.awt.event.KeyEvent;
import java.nio.file.Files;
import java.nio.file.Path;


class Controller implements ActionListener, MouseListener, MouseMotionListener, KeyListener
{
	View view;
	Model model;
	boolean keyLeft;
	boolean keyRight;
	boolean keyUp;
	boolean keyDown;

	Controller(Model m)
	{
		model = m;
	}

	void setView(View v)
	{
		view = v;
	}

	// saves the model to a file named "map.json" when you press the "save" button.
	public void saveModelToJson()
	{
		try {
			FileWriter writer = new FileWriter("map.json");
			writer.write(this.model.marshal().toString());
			writer.close();
		} catch (IOException exception) {
			exception.printStackTrace();
			System.exit(1);
		}
	}

	public void loadJsonToModel()
        throws IOException
    {
 
        Path fileName = Path.of("map.json");
        String str = Files.readString(fileName);

		this.model.unmarshal(str);
    }

	public void actionPerformed(ActionEvent e)
	{
		String button_text = e.getActionCommand();
		if (button_text == "Load Map") {
			// System.out.println("loading map...");
			try {
				this.loadJsonToModel();
				//  Block of code to try
			  }
			  catch(Exception ex) {
				//  Block of code to handle errors
			  }
		}
		else if (button_text == "Save Map") {
			// System.out.println("saving...");
			this.saveModelToJson();
		}
	}
	
	public void mousePressed(MouseEvent e)
	{
		model.setDestination(e.getX(), e.getY());

		if ((e.getX() >= 0 && e.getX() <= 200) && (e.getY() >= 0 && e.getY() <= 200) ) {
			// change what is currently selected
			if (model.selected_thing > 8) {
				model.selected_thing = 0;
			}
			else {
				model.selected_thing++;
			}
			
		} 
		else if (e.getButton() == 1) {
			// add "one of those things" to ArrayList
			model.addThing(e.getX(), e.getY());
		}
		else if (e.getButton() == 3) {
			// remove the closest thing (euclidian distance)
			model.removeThing(e.getX(), e.getY());
		}
	}

	public void mouseMoved(MouseEvent e) 
	{
		int currX = e.getX();
		int currY = e.getY();

		Point p = MouseInfo.getPointerInfo().getLocation();
		int screenX = (int)p.getX();
		int screenY = (int)p.getY();

		// 400 - 800 on X is okay no matter what Y is

		if (currX < 100) {
			// move mouse out of margin
			try {
				Robot rob = new Robot();
				rob.mouseMove(screenX + (100 - currX), screenY);
			}
			catch (Exception ex) {
				ex.printStackTrace();
				System.exit(1);
			}
			// move view in opposite direction
		}

		if (currX > 1100) {
			
			// move mouse out of margin
			try {
				Robot rob = new Robot();
				rob.mouseMove(screenX - (currX - 1100), screenY);
			}
			catch (Exception ex) {
				ex.printStackTrace();
				System.exit(1);
			}
			// move view in opposite direction
		}

		if (currY > 600) {
			// move mouse out of margin
			try {
				Robot rob = new Robot();
				rob.mouseMove(screenX, screenY - (currY - 600));
			}
			catch (Exception ex) {
				ex.printStackTrace();
				System.exit(1);
			}
			// move view in opposite direction
		}

		if (currY < 100) {
			// move mouse out of margin
			if (currX > 400 && currX < 800) return;
			try {
				Robot rob = new Robot();
				rob.mouseMove(screenX, screenY - (currY - 100));
			}
			catch (Exception ex) {
				ex.printStackTrace();
				System.exit(1);
			}
			// move view in opposite direction
		}

	}
	
	public void mouseDragged(MouseEvent e) 
	{	}

	public void mouseReleased(MouseEvent e) 
	{	}
	
	public void mouseEntered(MouseEvent e) 
	{	}
	
	public void mouseExited(MouseEvent e) 
	{	}
	
	public void mouseClicked(MouseEvent e) 
	{	}
	
	public void keyPressed(KeyEvent e)
	{
		switch(e.getKeyCode())
		{
			case KeyEvent.VK_RIGHT: 
				keyRight = true; 
				break;
			case KeyEvent.VK_LEFT: 
				keyLeft = true; 
				break;
			case KeyEvent.VK_UP: 
				keyUp = true; 
				break;
			case KeyEvent.VK_DOWN: 
				keyDown = true; 
				break;
		}
	}

	public void keyReleased(KeyEvent e)
	{
		switch(e.getKeyCode())
		{
			case KeyEvent.VK_RIGHT: 
				keyRight = false; 
				
				break;
			case KeyEvent.VK_LEFT: 
				keyLeft = false; 
				break;
			case KeyEvent.VK_UP: 
				keyUp = false; 
				break;
			case KeyEvent.VK_DOWN: 
				keyDown = false; 
				break;
			case KeyEvent.VK_ESCAPE:
				System.exit(0);
		}
		char c = Character.toLowerCase(e.getKeyChar());
		if(c == 'q')
			System.exit(0);
        if(c == 'r')
            model.reset();
	}

	public void keyTyped(KeyEvent e)
	{	}

	void update()
	{
		if(keyRight) 
            model.dest_x += Model.speed;
		if(keyLeft) 
    		model.dest_x -= Model.speed;
		if(keyDown) 
            model.dest_y += Model.speed;
		if(keyUp)
            model.dest_y -= Model.speed;
	}
}
