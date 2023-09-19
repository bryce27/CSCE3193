import javax.swing.JButton;
import javax.swing.JPanel;
import java.awt.Graphics;
import java.awt.image.BufferedImage;
import javax.imageio.ImageIO;
import java.io.File;
// import java.util.ArrayList;

// import javax.swing.JButton;
import java.awt.Color;

public class View extends JPanel
{
	JButton b1;
	JButton b2;
	BufferedImage[] images;
	Model model;
	// So add variables to your View class to represent the horizontal and vertical scroll positions of the view
	int scrollDeltaX = 0;
	int scrollDeltaY = 0;
	public int timeCounter = 0;

	View(Controller c, Model m, Game game)
	{
		// Make a button
		b1 = new JButton("Load Map");
		b2 = new JButton("Save Map");
		b1.addActionListener(c);
		b2.addActionListener(c);
		this.add(b1);
		this.add(b2);

		// Link up to other objects
		c.setView(this);
		model = m;

		// Send mouse events to the controller
		this.addMouseListener(c);
		this.addMouseMotionListener(c);

		this.images = new BufferedImage[game.THINGS.length];
		for (int i = 0; i < game.THINGS.length; i++) {
			try {
				String filename = "images/"+game.THINGS[i]+".png";
				this.images[i] = ImageIO.read(new File(filename));
			} catch(Exception e) {
				e.printStackTrace(System.err);
				System.exit(1);
			}
		}
	}

	public void scrollDown(int amount) {
		this.scrollDeltaY += amount;
	}

	public void scrollUp(int amount) {
		this.scrollDeltaY -= amount;
	}

	public void scrollRight(int amount) {
		this.scrollDeltaX += amount;
	}

	public void scrollLeft(int amount) {
		this.scrollDeltaX -= amount;
	}

	public void paintComponent(Graphics g)
	{
		this.timeCounter++;
		// Clear the background
		g.setColor(new Color(128, 255, 255));
		// using this color palette: https://www.color-hex.com/color-palette/100266
		g.setColor(new Color(132,208,125));
		g.fillRect(0, 0, this.getWidth(), this.getHeight());

		for (int i = 0; i < model.things.size(); i++) {
			try {
				int index = model.things.get(i).kind;
				int width = this.images[index].getWidth();
				int height = this.images[index].getHeight();

				g.drawImage(this.images[index], ((int)model.things.get(i).getPosition(this.timeCounter).getX() - width / 2) - this.scrollDeltaX, ((int)model.things.get(i).getPosition(this.timeCounter).getY() - height/2) - this.scrollDeltaY, null);
			} catch(Exception e) {
				e.printStackTrace(System.err);
				System.exit(1);
			}
		}

		g.setColor(new Color(73,71,134));
		g.fillRect(0, 0, 200, 200);

		g.drawImage(this.images[model.selected_thing], 0, 0, null);

		
	}
	
	// void removeButton()
	// {
	// 	this.remove(this.b1);
	// 	this.repaint();
	// }
}
